/**
 * productoService.js
 * ABML de productos y búsqueda avanzada por medidas/código/OEM/texto.
 */
import { withTransaction } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import * as repo from '../repositories/productoRepo.js';
import * as precioRepo from '../repositories/precioRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

/** Normaliza el payload de alta/edición al formato del repositorio. */
function normalize(data) {
  return {
    codigo: data.codigo,
    categoriaId: data.categoriaId ?? null,
    lanzamiento: data.lanzamiento ?? null,
    ejeTexto: data.ejeTexto ?? (data.ejeValor != null ? String(data.ejeValor) : null),
    ejeValor: data.ejeValor ?? null,
    alojTexto: data.alojTexto ?? (data.alojValor != null ? String(data.alojValor) : null),
    alojValor: data.alojValor ?? null,
    altTexto: data.altTexto ?? (data.altValor != null ? String(data.altValor) : null),
    altValor: data.altValor ?? null,
    giro: data.giro ?? null,
    uxb: data.uxb ?? null,
    observaciones: data.observaciones ?? null,
    precioLista: data.precioLista ?? null,
    proximoIngreso: data.proximoIngreso ? 1 : 0,
    stockMinimo: data.stockMinimo ?? 0,
    activo: data.activo === undefined ? 1 : data.activo ? 1 : 0,
    equivalencias: data.equivalencias ?? [],
  };
}

export const listar = (filtros, paginacion) => repo.list(filtros, paginacion);
export const buscarAvanzada = (filtros, paginacion) => repo.buscarAvanzada(filtros, paginacion);

export const obtener = async (id) => {
  const p = await repo.findById(id);
  if (!p) throw ApiError.notFound('Producto no encontrado');
  return p;
};

export const crear = async (data, actor) => {
  if (await repo.findByCodigo(data.codigo)) throw ApiError.conflict('Ya existe un producto con ese código');
  const p = normalize(data);

  const id = await withTransaction(async (conn) => {
    const nuevoId = await repo.create(conn, p);
    await repo.replaceEquivalencias(conn, nuevoId, p.equivalencias);
    await repo.ensureStock(conn, nuevoId, data.stockInicial ?? 0);
    if (p.precioLista != null) {
      await precioRepo.add(conn, {
        productoId: nuevoId, precioAnterior: null, precioNuevo: p.precioLista, origen: 'MANUAL', usuarioId: actor?.id,
      });
    }
    return nuevoId;
  });

  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'CREAR', entidad: 'producto', entidadId: id, datosDespues: data, ip: actor?.ip,
  });
  return obtener(id);
};

export const actualizar = async (id, data, actor) => {
  const actual = await obtener(id);
  if (data.codigo && data.codigo !== actual.codigo) {
    if (await repo.findByCodigo(data.codigo)) throw ApiError.conflict('Ya existe un producto con ese código');
  }
  const p = { ...normalize({ ...actual, ...data }), codigo: data.codigo ?? actual.codigo };

  await withTransaction(async (conn) => {
    await repo.update(conn, id, p);
    if (data.equivalencias) await repo.replaceEquivalencias(conn, id, p.equivalencias);
    if (data.precioLista != null && String(actual.precio_lista) !== String(p.precioLista)) {
      await precioRepo.add(conn, {
        productoId: id, precioAnterior: actual.precio_lista, precioNuevo: p.precioLista,
        origen: 'MANUAL', usuarioId: actor?.id,
      });
    }
  });

  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ACTUALIZAR', entidad: 'producto', entidadId: id,
    datosAntes: actual, datosDespues: p, ip: actor?.ip,
  });
  return obtener(id);
};

export const eliminar = async (id, actor) => {
  const actual = await obtener(id);
  await repo.remove(id);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ELIMINAR', entidad: 'producto', entidadId: id, datosAntes: actual, ip: actor?.ip,
  });
  return { ok: true };
};

export const setStockMinimo = async (id, stockMinimo, actor) => {
  await obtener(id);
  await repo.setStockMinimo(id, stockMinimo);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'AJUSTE_STOCK_MINIMO', entidad: 'producto', entidadId: id,
    datosDespues: { stockMinimo }, ip: actor?.ip,
  });
  return obtener(id);
};

export default { listar, buscarAvanzada, obtener, crear, actualizar, eliminar, setStockMinimo };
