/**
 * auth.js
 * Middleware de autenticación: valida el access token JWT y adjunta req.user.
 */
import { verifyAccessToken } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

export function authRequired(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Falta el token de acceso (Authorization: Bearer <token>)'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, email: payload.email, rol: payload.rol, rolId: payload.rolId };
    return next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return next(ApiError.unauthorized(expired ? 'Token expirado' : 'Token inválido'));
  }
}

export default authRequired;
