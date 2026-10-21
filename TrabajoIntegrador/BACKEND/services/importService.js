/**
 * importService.js
 * Importación completa de productos desde un Excel (usado por el módulo de importación
 * del backend). Comparte el núcleo de upsert con el script CLI.
 */
import fs from 'node:fs';
import { withTransaction, query } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { parseExcel } from '../import/excelParser.js';
import { upsertProducto } from '../import/productoImportCore.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

/** Vista previa sin escribir en la base. */
export const vistaPrevia = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) throw ApiError.badRequest('Archivo Excel no encontrado');
  const data = parseExcel(filePath);

  const codigos = data.productos.map((p) => p.codigo);
  let existentes = [];
  if (codigos.length) {
    const placeholders = codigos.map((_, i) => `:c${i}`).join(',');
    const params = Object.fromEntries(codigos.map((c, i) => [`c${i}`, c]));
    existentes = await query(`SELECT codigo FROM productos WHERE codigo IN (${placeholders})`, params);
  }
  const set = new Set(existentes.map((e) => e.codigo));

  return {
    meta: data.meta,
    categorias: data.categorias,
    resumen: {
      total: data.productos.length,
      nuevos: data.productos.filter((p) => !set.has(p.codigo)).length,
      existentes: data.productos.filter((p) => set.has(p.codigo)).length,
    },
    muestra: data.productos.slice(0, 25).map((p) => ({
      codigo: p.codigo, categoria: p.categoriaNombre, eje: p.ejeTexto, aloj: p.alojTexto, alt: p.altTexto,
      precioLista: p.precioLista, proximoIngreso: p.proximoIngreso,
    })),
    descartes: data.descartes,
    advertencias: data.advertencias,
  };
};

/** Importa (inserta/actualiza) los productos del Excel en una transacción. */
export const importar = async (filePath, actor) => {
  if (!filePath || !fs.existsSync(filePath)) throw ApiError.badRequest('Archivo Excel no encontrado');
  const data = parseExcel(filePath);

  const resumen = await withTransaction(async (conn) => {
    const categoriaCache = new Map();
    let insertados = 0;
    let actualizados = 0;
    for (const p of data.productos) {
      const r = await upsertProducto(conn, p, categoriaCache);
      if (r.accion === 'insertado') insertados += 1;
      else actualizados += 1;
    }
    return { insertados, actualizados, total: data.productos.length };
  });

  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'IMPORTAR_PRODUCTOS', entidad: 'producto',
    datosDespues: { ...resumen, archivo: data.meta.archivo }, ip: actor?.ip,
  });

  return { ...resumen, descartes: data.descartes.length, advertencias: data.advertencias.length };
};

export default { vistaPrevia, importar };
