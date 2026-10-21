/**
 * productoController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import * as service from '../services/productoService.js';

const actor = (req) => ({ id: req.user?.id, ip: req.ip });

export const listar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, total } = await service.listar(
    {
      categoriaId: req.query.categoriaId, giro: req.query.giro, lanzamiento: req.query.lanzamiento,
      codigo: req.query.codigo, texto: req.query.texto,
      activo: req.query.activo !== undefined ? Number(req.query.activo) : undefined,
      stockBajo: req.query.stockBajo,
    },
    { limit, offset },
  );
  response.ok(res, { items: rows, meta: buildMeta(total, page, limit) });
});

export const buscar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, total } = await service.buscarAvanzada(
    {
      codigo: req.query.codigo,
      eje: req.query.eje !== undefined ? Number(req.query.eje) : undefined,
      aloj: req.query.aloj !== undefined ? Number(req.query.aloj) : undefined,
      alt: req.query.alt !== undefined ? Number(req.query.alt) : undefined,
      tolerancia: req.query.tolerancia !== undefined ? Number(req.query.tolerancia) : undefined,
      oem: req.query.oem, texto: req.query.texto,
    },
    { limit, offset },
  );
  response.ok(res, { items: rows, meta: buildMeta(total, page, limit) });
});

export const obtener = asyncHandler(async (req, res) => {
  response.ok(res, await service.obtener(Number(req.params.id)));
});

export const crear = asyncHandler(async (req, res) => {
  response.created(res, await service.crear(req.body, actor(req)));
});

export const actualizar = asyncHandler(async (req, res) => {
  response.ok(res, await service.actualizar(Number(req.params.id), req.body, actor(req)));
});

export const eliminar = asyncHandler(async (req, res) => {
  response.ok(res, await service.eliminar(Number(req.params.id), actor(req)));
});

export const setStockMinimo = asyncHandler(async (req, res) => {
  response.ok(res, await service.setStockMinimo(Number(req.params.id), req.body.stockMinimo, actor(req)));
});

export default { listar, buscar, obtener, crear, actualizar, eliminar, setStockMinimo };
