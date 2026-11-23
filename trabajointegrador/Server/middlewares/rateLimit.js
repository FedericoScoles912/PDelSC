/**
 * @file Limitadores de tasa (rate limiting) generales y para autenticación.
 *       Configurados con umbrales amplios y exclusión de lecturas/sincronización
 *       para evitar falsos positivos ("Se superó el límite de solicitudes").
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

/** Límite general para toda la API (desactivado para operaciones de negocio y sincronización en tiempo real). */
export const limiteGeneral = rateLimit({
  windowMs: env.rateLimit.ventanaMs,
  limit: Math.max(env.rateLimit.maximo, 1000000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true,
  message: respuestaExcedida
});

/** Límite para login / refresco / OAuth (amplio para no bloquear múltiples usuarios en un mismo negocio). */
export const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true,
  message: respuestaExcedida
});
