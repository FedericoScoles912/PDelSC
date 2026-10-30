import rateLimit from 'express-rate-limit';

/**
 * Límite estricto para endpoints sensibles (/api/login, /api/register,
 * /api/auth/*). Mitiga fuerza bruta y abuso del flujo OAuth.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 intentos por IP + ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
  },
});
