/**
 * @file Middlewares de autenticación (JWT) y autorización por rol.
 * @module Server/middlewares/autenticacion
 */

import { ApiError } from '../utils/http.js';
import { verificarAccess } from '../utils/jwt.js';

/**
 * Exige un access token válido en `Authorization: Bearer <token>`.
 * Deja el payload en `req.usuario` = { sub, rol, email, nombre }.
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function autenticar(req, _res, next) {
  const encabezado = req.headers.authorization ?? '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(ApiError.noAutorizado('Falta el token de acceso.'));
  }

  try {
    req.usuario = verificarAccess(token);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.noAutorizado('La sesión expiró.', 'TOKEN_EXPIRADO'));
    }
    return next(ApiError.noAutorizado('Token inválido.', 'TOKEN_INVALIDO'));
  }
}

/**
 * Restringe el acceso a los roles indicados. Requiere `autenticar` antes.
 * @param {...string} roles Códigos de rol permitidos ('admin', 'deposito', 'vendedor').
 * @returns {import('express').RequestHandler}
 */
export function autorizar(...roles) {
  return (req, _res, next) => {
    if (!req.usuario) return next(ApiError.noAutorizado());
    if (roles.length && !roles.includes(req.usuario.rol)) {
      return next(ApiError.prohibido());
    }
    return next();
  };
}

/** Roles disponibles en el sistema. */
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  DEPOSITO: 'deposito',
  VENDEDOR: 'vendedor'
});
