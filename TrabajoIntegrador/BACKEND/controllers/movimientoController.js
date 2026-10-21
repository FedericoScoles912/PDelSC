/**
 * movimientoController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import * as service from '../services/movimientoService.js';

const actor = (req) => ({ id: req.user?.id, ip: req.ip });

export const listar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, total } = await service.listar(
    { productoId: req.query.productoId, tipo: req.query.tipo, desde: req.query.desde, hasta: req.query.hasta },
    { limit, offset },
  );
  response.ok(res, { items: rows, meta: buildMeta(total, page, limit) });
});

export const registrar = asyncHandler(async (req, res) => {
  response.created(res, await service.registrar(req.body, actor(req)));
});

export const ultimos = asyncHandler(async (req, res) => {
  response.ok(res, await service.ultimos(Number(req.query.limit) || 5));
});

export default { listar, registrar, ultimos };
