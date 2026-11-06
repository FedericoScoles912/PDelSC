/**
 * @file Servicio de importación: expone el listado y carga de archivos Excel,
 *       la lectura y vista previa, la aplicación real en TiDB/MySQL y el
 *       listado de logs recientes.
 * @module Server/servicios/importacion.servicio
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { env, resolverRuta } from '../config/env.js';
import { ApiError } from '../utils/http.js';
import { leerExcel } from '../../Scripts/lib/lector_excel.js';
import { generarPreview, aplicarImportacion } from '../../Scripts/lib/importador.js';

/**
 * Normaliza un nombre de archivo `.xlsx` evitando caracteres peligrosos.
 * @param {string} nombreOriginal
 * @returns {string}
 */
function sanitizarNombreExcel(nombreOriginal) {
  const base = path
    .basename(String(nombreOriginal || 'lista_precios.xlsx'))
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim();
  if (!base) return 'lista_precios.xlsx';
  return base.toLowerCase().endsWith('.xlsx') ? base : `${base}.xlsx`;
}

/**
 * Resuelve de forma segura la ruta absoluta de un archivo Excel dentro del proyecto
 * (`imports/` o raíz del proyecto). Si no se indica `archivo`, usa `env.importacion.excelPath`.
 * @param {string} [archivo]
 * @returns {Promise<string>}
 */
export async function resolverArchivoExcel(archivo) {
  if (!archivo || !String(archivo).trim()) {
    return resolverRuta(env.importacion.excelPath);
  }

  const limpio = String(archivo).replace(/\\/g, '/').trim();
  const baseNombre = path.basename(limpio);

  const candidatos = [
    resolverRuta(path.join('imports', baseNombre)),
    resolverRuta(baseNombre),
    resolverRuta(limpio)
  ];

  const raizNormalizada = path.resolve(env.raizProyecto);
  for (const rutaCandidata of candidatos) {
    const resuelta = path.resolve(rutaCandidata);
    if (!resuelta.startsWith(raizNormalizada)) {
      continue;
    }
    try {
      const stat = await fs.stat(resuelta);
      if (stat.isFile() && resuelta.toLowerCase().endsWith('.xlsx')) {
        return resuelta;
      }
    } catch {
      /* probar siguiente */
    }
  }

  throw new ApiError(404, 'ARCHIVO_NO_ENCONTRADO', `No se encontró el archivo Excel seleccionado: "${baseNombre}"`);
}

/**
 * Lista todos los archivos `.xlsx` disponibles en `imports/` y en la raíz del proyecto.
 * @returns {Promise<{predeterminado: string, archivos: Array<Object>}>}
 */
export async function listarArchivosExcel() {
  const rutaPredeterminada = resolverRuta(env.importacion.excelPath);
  const nombrePredeterminado = path.basename(rutaPredeterminada);
  const encontrados = new Map();

  const escanearDirectorio = async (dirAbsoluto, prefijoId, etiquetaUbicacion) => {
    let entradas;
    try {
      entradas = await fs.readdir(dirAbsoluto);
    } catch {
      return;
    }

    for (const nombre of entradas) {
      if (!nombre.toLowerCase().endsWith('.xlsx') || nombre.startsWith('~$')) {
        continue;
      }
      const rutaAbs = path.join(dirAbsoluto, nombre);
      try {
        const stat = await fs.stat(rutaAbs);
        if (!stat.isFile()) continue;
        const id = prefijoId ? `${prefijoId}/${nombre}` : nombre;
        if (!encontrados.has(nombre)) {
          encontrados.set(nombre, {
            id,
            nombre,
            ubicacion: etiquetaUbicacion,
            tamanoBytes: stat.size,
            modificadoEn: stat.mtime.toISOString(),
            esPredeterminado: nombre === nombrePredeterminado
          });
        }
      } catch {
        /* ignorar archivo inaccesible */
      }
    }
  };

  await escanearDirectorio(resolverRuta('imports'), 'imports', 'Carpeta imports/');
  await escanearDirectorio(env.raizProyecto, '', 'Raíz del proyecto');

  const archivos = Array.from(encontrados.values()).sort((a, b) => {
    if (a.esPredeterminado !== b.esPredeterminado) return a.esPredeterminado ? -1 : 1;
    return b.modificadoEn.localeCompare(a.modificadoEn);
  });

  const predeterminadoItem = archivos.find((a) => a.esPredeterminado) ?? archivos[0] ?? null;

  return {
    predeterminado: predeterminadoItem?.id ?? nombrePredeterminado,
    archivos
  };
}

/**
 * Recibe un archivo `.xlsx` en Base64, lo guarda en `imports/`, valida su estructura
 * y devuelve inmediatamente su vista previa.
 * @param {Object} params
 * @param {string} params.nombre
 * @param {string} params.contenidoBase64
 * @param {string} [params.hoja]
 * @returns {Promise<{archivo: Object, preview: Object}>}
 */
export async function subirArchivoExcel({ nombre, contenidoBase64, hoja } = {}) {
  if (!contenidoBase64 || typeof contenidoBase64 !== 'string') {
    throw new ApiError(400, 'ARCHIVO_REQUERIDO', 'Debés seleccionar un archivo Excel (.xlsx) válido.');
  }

  const nombreSeguro = sanitizarNombreExcel(nombre);
  const base64Limpio = contenidoBase64.includes(',')
    ? contenidoBase64.slice(contenidoBase64.indexOf(',') + 1)
    : contenidoBase64;

  const buffer = Buffer.from(base64Limpio, 'base64');
  if (!buffer || buffer.length < 100) {
    throw new ApiError(400, 'ARCHIVO_INVALIDO', 'El archivo Excel seleccionado está vacío o dañado.');
  }

  const dirImports = resolverRuta('imports');
  await fs.mkdir(dirImports, { recursive: true });
  const rutaDestino = path.join(dirImports, nombreSeguro);
  await fs.writeFile(rutaDestino, buffer);

  try {
    const datos = await leerExcel(rutaDestino, hoja ? { hoja } : {});
    const preview = await generarPreview(datos);
    const stat = await fs.stat(rutaDestino);

    return {
      archivo: {
        id: `imports/${nombreSeguro}`,
        nombre: nombreSeguro,
        ubicacion: 'Carpeta imports/',
        tamanoBytes: stat.size,
        modificadoEn: stat.mtime.toISOString(),
        esPredeterminado: false
      },
      preview
    };
  } catch (error) {
    throw new ApiError(
      400,
      'EXCEL_FORMATO_INVALIDO',
      error instanceof Error
        ? `El archivo "${nombreSeguro}" no pudo procesarse: ${error.message}`
        : 'El archivo Excel no tiene el formato esperado.'
    );
  }
}

/**
 * Lee el Excel indicado (o el predeterminado) y genera la vista previa sin escribir en la base.
 * @param {Object} [opciones]
 * @param {string} [opciones.archivo]
 * @param {string} [opciones.hoja]
 * @returns {Promise<Object>}
 */
export async function previsualizar({ archivo, hoja } = {}) {
  const ruta = await resolverArchivoExcel(archivo);
  const datos = await leerExcel(ruta, hoja ? { hoja } : {});
  return generarPreview(datos);
}

/**
 * Guarda un registro JSON en `imports/logs/` tras aplicar una importación.
 * @param {Object} meta
 * @param {Object} resumen
 * @param {number|null} usuarioId
 * @returns {Promise<string|null>}
 */
async function guardarLogImportacion(meta, resumen, usuarioId) {
  try {
    const directorio = resolverRuta(env.importacion.logDir);
    await fs.mkdir(directorio, { recursive: true });
    const marca = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreArchivo = `import_${marca}.json`;
    const ruta = path.join(directorio, nombreArchivo);
    await fs.writeFile(
      ruta,
      JSON.stringify(
        {
          fecha: new Date().toISOString(),
          usuarioId,
          meta,
          resumen
        },
        null,
        2
      ),
      'utf8'
    );
    return nombreArchivo;
  } catch {
    return null;
  }
}

/**
 * Aplica la importación del Excel seleccionado sobre la base de datos.
 * @param {Object} [opciones]
 * @param {string} [opciones.archivo]
 * @param {string} [opciones.hoja]
 * @param {number|null} [opciones.usuarioId]
 * @returns {Promise<Object>}
 */
export async function aplicar({ archivo, hoja, usuarioId = null } = {}) {
  const ruta = await resolverArchivoExcel(archivo);
  const datos = await leerExcel(ruta, hoja ? { hoja } : {});
  const resumen = await aplicarImportacion(datos, { usuarioId });
  const logGenerado = await guardarLogImportacion(datos.meta, resumen, usuarioId);

  return {
    ...resumen,
    archivo: datos.meta.archivo,
    hoja: datos.meta.hoja,
    logGenerado
  };
}

/**
 * Lista los últimos logs de importación (.json), ordenados por fecha desc.
 * @returns {Promise<string[]>}
 */
export async function ultimosLogs() {
  const directorio = resolverRuta(env.importacion.logDir);

  let archivos;
  try {
    archivos = await fs.readdir(directorio);
  } catch {
    return [];
  }

  return archivos
    .filter((nombre) => nombre.toLowerCase().endsWith('.json'))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 20);
}
