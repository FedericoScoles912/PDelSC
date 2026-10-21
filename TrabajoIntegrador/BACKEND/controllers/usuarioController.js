/**
 * usuarioController.js
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import * as response from '../utils/response.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import * as usuarioService from '../services/usuarioService.js';

const actor = (req) => ({ id: req.user?.id, ip: req.ip });

export const listar = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { rows, total } = await usuarioService.listar(
    { search: req.query.search, rolId: req.query.rolId, activo: req.query.activo },
    { limit, offset },
  );
  response.ok(res, { items: rows, meta: buildMeta(total, page, limit) });
});

export const obtener = asyncHandler(async (req, res) => {
  response.ok(res, await usuarioService.obtener(Number(req.params.id)));
});

export const crear = asyncHandler(async (req, res) => {
  response.created(res, await usuarioService.crear(req.body, actor(req)));
});

export const actualizar = asyncHandler(async (req, res) => {
  response.ok(res, await usuarioService.actualizar(Number(req.params.id), req.body, actor(req)));
});

export const cambiarEstado = asyncHandler(async (req, res) => {
  response.ok(res, await usuarioService.cambiarEstado(Number(req.params.id), req.body.activo, actor(req)));
});

export const cambiarRol = asyncHandler(async (req, res) => {
  response.ok(res, await usuarioService.cambiarRol(Number(req.params.id), req.body.rolId, actor(req)));
});

export const eliminar = asyncHandler(async (req, res) => {
  response.ok(res, await usuarioService.eliminar(Number(req.params.id), actor(req)));
});

export default { listar, obtener, crear, actualizar, cambiarEstado, cambiarRol, eliminar };
