/**
 * rolController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import * as rolRepo from '../repositories/rolRepo.js';
import ApiError from '../utils/ApiError.js';

export const listar = asyncHandler(async (_req, res) => {
  response.ok(res, await rolRepo.list());
});

export const obtener = asyncHandler(async (req, res) => {
  const rol = await rolRepo.findById(Number(req.params.id));
  if (!rol) throw ApiError.notFound('Rol no encontrado');
  response.ok(res, rol);
});

export default { listar, obtener };
