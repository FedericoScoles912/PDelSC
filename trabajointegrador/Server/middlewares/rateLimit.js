/**
 * @file Limitadores de tasa (rate limiting) generales y para autenticación.
 *       Se desactivan en el entorno de pruebas para no interferir con los tests.
 * @module Server/middlewares/rateLimit
 */

import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

/** Cuerpo de respuesta uniforme al exceder el límite. */
const respuestaExcedida = {
  ok: false,
  error: {
    codigo: 'DEMASIADAS_SOLICITUDES',
    mensaje: 'Se superó el límite de solicitudes. Esperá un momento e intentá de nuevo.'
  }
};

/** Límite general para toda la API. */
export const limiteGeneral = rateLimit({
  windowMs: env.rateLimit.ventanaMs,
  limit: env.rateLimit.maximo,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: respuestaExcedida
});

/** Límite estricto para login / refresco / OAuth (evita fuerza bruta). */
export const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: respuestaExcedida
});
