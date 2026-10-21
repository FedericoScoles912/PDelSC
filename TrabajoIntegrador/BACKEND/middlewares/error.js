/**
 * error.js
 * Middleware centralizado de manejo de errores. Traduce a JSON coherente.
 */
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

// 404 para rutas no encontradas
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Manejador central
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let details = err.details;

  // Errores conocidos de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Ya existe un registro con esos datos (valor duplicado).';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 422;
    message = 'Referencia inexistente (clave foránea inválida).';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    status = 503;
    message = 'No se pudo conectar con la base de datos.';
  }

  const payload = { ok: false, error: { message, details } };
  if (!env.isProd && status >= 500) payload.error.stack = err.stack;

  if (status >= 500) logger.error(`${req.method} ${req.originalUrl} ->`, err.message, err.stack || '');
  else logger.warn(`${req.method} ${req.originalUrl} -> ${status} ${message}`);

  res.status(status).json(payload);
}

export default { notFound, errorHandler };
