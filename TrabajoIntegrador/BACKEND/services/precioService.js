/**
 * precioService.js
 * Historial de precios y re-importación de listas con vista previa de cambios.
 */
import ApiError from '../utils/ApiError.js';
import { withTransaction, query } from '../config/db.js';
import { parseExcel } from '../import/excelParser.js';
import * as precioRepo from '../repositories/precioRepo.js';
import * as productoRepo from '../repositories/productoRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

export const historialProducto = (productoId, paginacion) =>
  precioRepo.historialPorProducto(productoId, paginacion);

export const actualizarPrecio = async (productoId, { precioLista, proximoIngreso = 0 }, actor) => {
  const producto = await productoRepo.findById(productoId);
  if (!producto) throw ApiError.notFound('Producto no encontrado');

  await withTransaction(async (conn) => {
    await productoRepo.setPrecio(conn, productoId, precioLista, proximoIngreso ? 1 : 0);
    await precioRepo.add(conn, {
      productoId, precioAnterior: producto.precio_lista, precioNuevo: precioLista,
      origen: 'MANUAL', usuarioId: actor?.id,
    });
  });

  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ACTUALIZAR_PRECIO', entidad: 'producto', entidadId: productoId,
    datosAntes: { precioLista: producto.precio_lista }, datosDespues: { precioLista }, ip: actor?.ip,
  });
  return productoRepo.findById(productoId);
};

/**
 * Analiza un Excel de lista de precios y compara contra la base para mostrar
 * el impacto ANTES de confirmar (no escribe nada).
 * @param {string} filePath
 */
export const vistaPreviaImportacion = async (filePath) => {
  const data = parseExcel(filePath);
  const codigos = data.productos.map((p) => p.codigo);

  // Trae precios actuales en un solo query (evita N consultas)
  let actuales = [];
  if (codigos.length) {
    const placeholders = codigos.map((_, i) => `:c${i}`).join(',');
    const params = Object.fromEntries(codigos.map((c, i) => [`c${i}`, c]));
    actuales = await query(
      `SELECT id, codigo, precio_lista FROM productos WHERE codigo IN (${placeholders})`,
      params,
    );
  }
  const mapa = new Map(actuales.map((r) => [r.codigo, r]));

  const cambios = [];
  const nuevos = [];
  for (const p of data.productos) {
    const actual = mapa.get(p.codigo);
    if (!actual) {
      nuevos.push({ codigo: p.codigo, precioNuevo: p.precioLista, proximoIngreso: p.proximoIngreso, categoria: p.categoriaNombre });
      continue;
    }
    const cambioPrecio = String(actual.precio_lista) !== String(p.precioLista);
    const cambioProximo = p.proximoIngreso === 1;
    if (cambioPrecio || cambioProximo) {
      cambios.push({
        productoId: actual.id,
        codigo: p.codigo,
        precioAnterior: actual.precio_lista,
        precioNuevo: p.precioLista,
        proximoIngreso: p.proximoIngreso,
        variacionPct:
          actual.precio_lista && p.precioLista
            ? Number((((p.precioLista - actual.precio_lista) / actual.precio_lista) * 100).toFixed(2))
            : null,
      });
    }
  }

  return {
    meta: data.meta,
    categorias: data.categorias,
    resumen: {
      totalEnArchivo: data.productos.length,
      nuevos: nuevos.length,
      conCambios: cambios.length,
      sinCambios: data.productos.length - nuevos.length - cambios.length,
    },
    nuevos,
    cambios,
    descartes: data.descartes,
    advertencias: data.advertencias,
  };
};

/**
 * Confirma la importación de una lista: re-lee el archivo y aplica los cambios
 * (precio y flag de próximo ingreso) en una sola transacción, registrando historial.
 * @param {string} filePath
 * @param {object} actor
 */
export const confirmarImportacion = async (filePath, actor) => {
  const data = parseExcel(filePath);

  const resultado = await withTransaction(async (conn) => {
    let actualizados = 0;
    const codigos = data.productos.map((p) => p.codigo);
    const placeholders = codigos.map((_, i) => `:c${i}`).join(',');
    const params = Object.fromEntries(codigos.map((c, i) => [`c${i}`, c]));
    const [rows] = await conn.execute(
      `SELECT id, codigo, precio_lista FROM productos WHERE codigo IN (${placeholders})`,
      params,
    );
    const mapa = new Map(rows.map((r) => [r.codigo, r]));

    for (const p of data.productos) {
      const actual = mapa.get(p.codigo);
      if (!actual) continue;
      if (String(actual.precio_lista) === String(p.precioLista) && !p.proximoIngreso) continue;

      await conn.execute(
        `UPDATE productos SET precio_lista = :precio, proximo_ingreso = :prox WHERE id = :id`,
        { id: actual.id, precio: p.precioLista, prox: p.proximoIngreso },
      );
      await precioRepo.add(conn, {
        productoId: actual.id, precioAnterior: actual.precio_lista, precioNuevo: p.precioLista,
        origen: 'IMPORTACION', usuarioId: actor?.id,
      });
      actualizados += 1;
    }
    return { actualizados };
  });

  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'IMPORTAR_PRECIOS', entidad: 'producto',
    datosDespues: resultado, ip: actor?.ip,
  });
  return resultado;
};

export default { historialProducto, actualizarPrecio, vistaPreviaImportacion, confirmarImportacion };
