/**
 * categoriaController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import * as service from '../services/categoriaService.js';

const actor = (req) => ({ id: req.user?.id, ip: req.ip });

export const listar = asyncHandler(async (req, res) => {
  const soloActivas = req.query.todas !== 'true';
  response.ok(res, await service.listar(soloActivas));
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

export default { listar, obtener, crear, actualizar, eliminar };
