/**
 * rateLimit.js
 * Limitadores de tasa (global y estricto para autenticación).
 */
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { message: 'Demasiadas solicitudes, intentá más tarde.' } },
});

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { message: 'Demasiados intentos. Esperá unos minutos.' } },
});

export default { globalLimiter, authLimiter };
