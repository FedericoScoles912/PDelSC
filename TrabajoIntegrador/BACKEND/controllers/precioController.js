/**
 * precioController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import * as service from '../services/precioService.js';
import ApiError from '../utils/ApiError.js';

const actor = (req) => ({ id: req.user?.id, ip: req.ip });

export const historial = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, total } = await service.historialProducto(Number(req.params.id), { limit, offset });
  response.ok(res, { items: rows, meta: buildMeta(total, page, limit) });
});

export const actualizar = asyncHandler(async (req, res) => {
  response.ok(res, await service.actualizarPrecio(Number(req.params.id), req.body, actor(req)));
});

export const vistaPrevia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Subí un archivo Excel (.xlsx)');
  response.ok(res, await service.vistaPreviaImportacion(req.file.path));
});

export const confirmar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Subí un archivo Excel (.xlsx)');
  response.ok(res, await service.confirmarImportacion(req.file.path, actor(req)));
});

export default { historial, actualizar, vistaPrevia, confirmar };
