/**
 * @file Lector del Excel de lista de precios EMIC (`hoja "Por Medidas"`).
 *       Devuelve los datos ya normalizados y listos para persistir o para
 *       generar SQL. No toca la base de datos: es 100% puro y testeable.
 * @module Scripts/lib/lector_excel
 */

import ExcelJS from 'exceljs';

import {
  limpiarTexto,
  esVacio,
  normalizarCodigo,
  aNumero,
  interpretarPrecio,
  normalizarNombreCategoria,
  redondear
} from './texto.js';
import { parsearMedidas } from './medidas.js';

/** Nombre de la hoja con la lista de precios. */
export const NOMBRE_HOJA = 'Por Medidas';

/** Patrones para ubicar cada columna por su encabezado (tolerante a cambios). */
const PATRONES = {
  codigo: /c[oó]digo|sku/i,
  categoria: /^categor[ií]a|^rubro$/i,
  lanzamiento: /lanzam/i,
  giro: /^giro$/i,
  uxb: /u\s*x\s*b|unid/i,
  observaciones: /observaci|descripci[oó]n/i,
  oem: /^oem$/i,
  disponibilidad: /disp|^stock$/i,
  proxEmbarque: /prox/i,
  precio: /precio/i
};

/**
 * @typedef {Object} ProductoImportado
 * @property {number} fila
 * @property {string} codigo
 * @property {string|null} categoriaNombre
 * @property {boolean} lanzamiento
 * @property {string|null} ejeTexto
 * @property {number|null} ejeValor
 * @property {string|null} alojTexto
 * @property {number|null} alojValor
 * @property {string|null} altTexto
 * @property {number|null} altValor
 * @property {string|null} giro
 * @property {number|null} uxb
 * @property {string|null} observaciones
 * @property {number|null} precioLista
 * @property {number} proximoIngreso
 * @property {number} proximoEmbarque
 * @property {number} stockInicial
 * @property {number} stockMinimo
 * @property {Array<{tipo:string, codigo:string}>} equivalencias
 */

/**
 * Lee y normaliza el Excel completo.
 * @param {string} rutaArchivo
 * @param {Object} [opciones]
 * @param {string} [opciones.hoja]
 * @returns {Promise<{categorias:string[], productos:ProductoImportado[], descartes:Array, advertencias:Array, meta:Object}>}
 */
export async function leerExcel(rutaArchivo, opciones = {}) {
  const nombreHoja = opciones.hoja ?? NOMBRE_HOJA;
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.readFile(rutaArchivo);

  const hojas = libro.worksheets.map((w) => w.name);
  const hoja = libro.getWorksheet(nombreHoja) || libro.worksheets[0];
  if (!hoja) {
    throw new Error(`No se encontró ninguna hoja en el archivo ${rutaArchivo}`);
  }

  const matriz = extraerMatriz(hoja);
  const columnas = detectarColumnas(matriz);
  const resultado = procesarFilas(matriz, columnas);

  return {
    ...resultado,
    meta: {
      archivo: rutaArchivo.split(/[\\/]/).pop(),
      hoja: hoja.name,
      hojas,
      totalFilas: hoja.rowCount,
      filaEncabezado: columnas.filaEncabezado,
      totalCategorias: resultado.categorias.length,
      productosValidos: resultado.productos.length,
      descartados: resultado.descartes.length,
      advertencias: resultado.advertencias.length,
      fechaProceso: new Date().toISOString()
    }
  };
}

/**
 * Convierte la hoja en una matriz de strings limpios (índice 1 = columna 1).
 * @param {import('exceljs').Worksheet} hoja
 * @returns {string[][]}
 */
function extraerMatriz(hoja) {
  const matriz = [];
  for (let f = 1; f <= hoja.rowCount; f += 1) {
    const fila = hoja.getRow(f);
    const valores = new Array(hoja.columnCount + 1).fill('');
    for (let c = 1; c <= hoja.columnCount; c += 1) {
      valores[c] = limpiarTexto(fila.getCell(c).value);
    }
    matriz[f] = valores;
  }
  return matriz;
}

/**
 * Detecta la fila de encabezado y el índice de cada columna de interés.
 * @param {string[][]} matriz
 * @returns {Object}
 */
function detectarColumnas(matriz) {
  let filaEncabezado = -1;
  let esEncabezadoSimple = false;
  for (let f = 1; f < matriz.length; f += 1) {
    const fila = matriz[f] ?? [];
    const tieneCodigoProducto = fila.some(
      (valor) => /c[oó]digo/i.test(valor) && /producto/i.test(valor)
    );
    if (tieneCodigoProducto) {
      filaEncabezado = f;
      break;
    }
  }
  if (filaEncabezado === -1) {
    for (let f = 1; f < matriz.length; f += 1) {
      const fila = matriz[f] ?? [];
      const tieneCodigoSimple = fila.some((valor) => /^(c[oó]digo|sku)(\s+producto)?$/i.test(valor));
      if (tieneCodigoSimple) {
        filaEncabezado = f;
        esEncabezadoSimple = true;
        break;
      }
    }
  }
  if (filaEncabezado === -1) {
    throw new Error(
      'No se pudo detectar la fila de encabezado (se esperaba una columna "CODIGO PRODUCTO" o "CODIGO")'
    );
  }

  // Los encabezados pueden ocupar 1 fila (planillas simples) o 2-3 filas (grupo + sub-encabezados EJE/ALOJ/ALT).
  const filasEncabezado = esEncabezadoSimple
    ? [matriz[filaEncabezado]]
    : [matriz[filaEncabezado], matriz[filaEncabezado + 1] ?? [], matriz[filaEncabezado + 2] ?? []];

  const columnas = {
    filaEncabezado,
    primerDato: esEncabezadoSimple ? filaEncabezado + 1 : filaEncabezado + 3
  };
  for (const [clave, patron] of Object.entries(PATRONES)) {
    columnas[clave] = buscarColumna(filasEncabezado, patron);
  }
  columnas.eje = buscarColumna(filasEncabezado, /^eje$/i);
  columnas.aloj = buscarColumna(filasEncabezado, /^aloj/i);
  columnas.alt = buscarColumna(filasEncabezado, /^alt/i);
  columnas.equivalenciaA = buscarColumna([matriz[filaEncabezado]], /^a$/i);
  columnas.equivalenciaS = buscarColumna([matriz[filaEncabezado]], /^s$/i);

  // El primer dato real en planillas EMIC multi-fila está después de la 3ª fila de encabezado.
  if (!esEncabezadoSimple && columnas.eje) columnas.primerDato = filaEncabezado + 3;

  return columnas;
}

/**
 * Busca el índice de la primera columna cuya celda coincida con el patrón.
 * @param {string[][]} filas
 * @param {RegExp} patron
 * @returns {number}
 */
function buscarColumna(filas, patron) {
  for (const fila of filas) {
    for (let c = 1; c < (fila?.length ?? 0); c += 1) {
      const valor = fila[c];
      if (valor && patron.test(valor)) return c;
    }
  }
  return 0;
}

/**
 * Recorre las filas de datos y clasifica cada una.
 * @param {string[][]} matriz
 * @param {Object} columnas
 * @returns {{categorias:string[], productos:ProductoImportado[], descartes:Array, advertencias:Array}}
 */
function procesarFilas(matriz, columnas) {
  const categorias = [];
  const productos = [];
  const descartes = [];
  const advertencias = [];
  const codigosVistos = new Map();

  let categoriaActual = null;

  for (let f = columnas.primerDato; f < matriz.length; f += 1) {
    const fila = matriz[f] ?? [];
    const textoCol1 = limpiarTexto(fila[1]);
    const textoCodigo = limpiarTexto(fila[columnas.codigo]);

    if (!textoCol1 && !textoCodigo) continue;

    // 1) Fila-encabezado de CATEGORÍA (texto en la columna 1, sin código válido)
    if (textoCol1 && !esCodigoValido(textoCodigo)) {
      const nombre = normalizarNombreCategoria(textoCol1);
      if (nombre && !categorias.includes(nombre)) categorias.push(nombre);
      categoriaActual = nombre || categoriaActual;
      continue;
    }

    // 2) Producto válido
    if (esCodigoValido(textoCodigo)) {
      const codigo = normalizarCodigo(textoCodigo);

      if (codigosVistos.has(codigo)) {
        descartes.push({
          fila: f,
          codigo,
          motivo: `Código duplicado (ya importado en fila ${codigosVistos.get(codigo)})`
        });
        continue;
      }
      codigosVistos.set(codigo, f);

      let catProducto = categoriaActual;
      if (columnas.categoria && fila[columnas.categoria]) {
        const catExplicita = normalizarNombreCategoria(limpiarTexto(fila[columnas.categoria]));
        if (catExplicita) {
          if (!categorias.includes(catExplicita)) categorias.push(catExplicita);
          catProducto = catExplicita;
        }
      }

      productos.push(construirProducto(fila, columnas, codigo, catProducto, f));
      continue;
    }

    // 3) Sub-cabecera / marca decorativa (ej. "M E R C E D E S   B E N Z")
    if (textoCodigo) {
      advertencias.push({
        fila: f,
        motivo: `Sub-cabecera/marca ignorada: "${textoCodigo}"`,
        categoria: categoriaActual
      });
    }
  }

  return { categorias, productos, descartes, advertencias };
}

/**
 * Construye el objeto de producto a partir de la fila.
 * @param {string[]} fila
 * @param {Object} columnas
 * @param {string} codigo
 * @param {string|null} categoriaNombre
 * @param {number} numeroFila
 * @returns {ProductoImportado}
 */
function construirProducto(fila, columnas, codigo, categoriaNombre, numeroFila) {
  const medidas = parsearMedidas(
    fila[columnas.eje],
    fila[columnas.aloj],
    fila[columnas.alt]
  );
  const precio = interpretarPrecio(fila[columnas.precio]);
  const giro = limpiarTexto(fila[columnas.giro]).toUpperCase();
  const uxb = aNumero(fila[columnas.uxb]);
  const disponibilidad = aNumero(fila[columnas.disponibilidad]);
  const proxEmbarque = aNumero(fila[columnas.proxEmbarque]);

  return {
    fila: numeroFila,
    codigo,
    categoriaNombre,
    lanzamiento: /LANZAMIENTO/i.test(limpiarTexto(fila[columnas.lanzamiento])),
    ejeTexto: medidas.eje.texto,
    ejeValor: medidas.eje.valor,
    alojTexto: medidas.aloj.texto,
    alojValor: medidas.aloj.valor,
    altTexto: medidas.alt.texto,
    altValor: medidas.alt.valor,
    giro: giro && !esVacio(giro) ? giro : null,
    uxb: uxb === null ? null : Math.trunc(uxb),
    observaciones: limpiarTexto(fila[columnas.observaciones]) || null,
    precioLista: redondear(precio.precio, 2),
    proximoIngreso: precio.proximoIngreso,
    proximoEmbarque: proxEmbarque === null ? 0 : Math.max(0, Math.trunc(proxEmbarque)),
    stockInicial: disponibilidad === null ? 0 : Math.max(0, Math.trunc(disponibilidad)),
    stockMinimo: 0,
    equivalencias: extraerEquivalencias(fila, columnas)
  };
}

/**
 * Extrae las equivalencias OEM / A / S (multi-línea) de la fila.
 * @param {string[]} fila
 * @param {Object} columnas
 * @returns {Array<{tipo:string, codigo:string}>}
 */
function extraerEquivalencias(fila, columnas) {
  const resultado = [];
  const grupos = [
    { tipo: 'OEM', columna: columnas.oem },
    { tipo: 'A', columna: columnas.equivalenciaA },
    { tipo: 'S', columna: columnas.equivalenciaS }
  ];

  for (const { tipo, columna } of grupos) {
    if (!columna) continue;
    const contenido = limpiarTexto(fila[columna]);
    if (!contenido || esVacio(contenido)) continue;

    for (const linea of contenido.split('\n')) {
      const codigo = normalizarCodigoEquivalencia(linea);
      if (codigo) resultado.push({ tipo, codigo });
    }
  }

  // Deduplicar (tipo + código)
  const vistos = new Set();
  return resultado.filter((e) => {
    const clave = `${e.tipo}:${e.codigo}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

/**
 * Limpia y valida un código de equivalencia (quita prefijos como "OE:").
 * @param {string} valor
 * @returns {string|null}
 */
function normalizarCodigoEquivalencia(valor) {
  const texto = limpiarTexto(valor)
    .replace(/^(OEM|OE|O\.E\.|N[°º]?)\s*:?\s*/i, '')
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!texto || esVacio(texto)) return null;
  return texto;
}

/**
 * Determina si un texto es un código de producto válido (contiene dígitos y
 * al menos 4 caracteres tras normalizar).
 * @param {string} valor
 * @returns {boolean}
 */
export function esCodigoValido(valor) {
  const codigo = normalizarCodigo(valor);
  if (codigo.length < 4) return false;
  return /^[A-Z0-9]+$/.test(codigo) && /\d/.test(codigo);
}
