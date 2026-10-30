/**
 * @file Servicio de importación: expone la lectura del Excel, la vista previa,
 *       la aplicación real y el listado de logs recientes.
 * @module Server/servicios/importacion.servicio
 */

import fs from 'node:fs/promises';

import { env, resolverRuta } from '../config/env.js';
import { leerExcel } from '../../Scripts/lib/lector_excel.js';
import { generarPreview, aplicarImportacion } from '../../Scripts/lib/importador.js';

/**
 * Lee el Excel configurado y genera la vista previa (no escribe en la base).
 * @returns {Promise<Object>}
 */
export async function previsualizar() {
  const ruta = resolverRuta(env.importacion.excelPath);
  const datos = await leerExcel(ruta);
  return generarPreview(datos);
}

/**
 * Aplica la importación del Excel configurado sobre la base de datos.
 * @param {Object} [opciones]
 * @param {number|null} [opciones.usuarioId]
 * @returns {Promise<Object>}
 */
export async function aplicar({ usuarioId = null } = {}) {
  const ruta = resolverRuta(env.importacion.excelPath);
  const datos = await leerExcel(ruta);
  return aplicarImportacion(datos, { usuarioId });
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
