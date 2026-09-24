import env from '../config/env.js';
import { escapeHtml } from '../services/validationService.js';

/**
 * Middleware de manejo centralizado de errores.
 * Debe ser el último .use() antes de server.listen().
 */
// eslint-disable-next-line no-unused-vars
export default function errorMiddleware(err, req, res, next) {
  const id = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let status = err.status || 500;
  let message = err.message || 'Error interno del servidor';
  const details = err.details || undefined;

  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    if (/email/i.test(err.message)) message = 'El email ya se encuentra registrado';
    else if (/username/i.test(err.message)) message = 'El username ya se encuentra en uso';
    else message = 'Registro duplicado';
  }

  if (env.nodeEnv !== 'production') {
    console.error(`[${id}]`, err);
  }

  res.status(status).json({
    ok: false,
    error: escapeHtml(message),
    details: env.nodeEnv !== 'production' ? details : undefined,
    requestId: id,
  });
}
