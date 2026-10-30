/**
 * @file Middlewares de manejo de errores (404 y manejador central).
 * @module Server/middlewares/errores
 */

import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

/**
 * Responde 404 para cualquier ruta no montada.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      codigo: 'RUTA_NO_ENCONTRADA',
      mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    }
  });
}

/**
 * Traduce errores conocidos (Zod, MySQL/TiDB, ApiError) a respuestas uniformes.
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
export function manejadorErrores(error, req, res, _next) {
  let estado = error.estado ?? 500;
  let codigo = error.codigo ?? 'ERROR_INTERNO';
  let mensaje = error.mensaje ?? error.message ?? 'Error interno del servidor.';
  let detalles = error.detalles ?? null;

  // Validación con Zod.
  if (error instanceof ZodError) {
    estado = 400;
    codigo = 'DATOS_INVALIDOS';
    mensaje = 'Los datos enviados no son válidos.';
    detalles = error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensaje: issue.message
    }));
  }

  // Errores de MySQL/TiDB más comunes.
  if (error.code === 'ER_DUP_ENTRY') {
    estado = 409;
    codigo = 'DUPLICADO';
    mensaje = 'Ya existe un registro con esos datos únicos.';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2') {
    estado = 409;
    codigo = 'REFERENCIA_INVALIDA';
    mensaje = 'La operación viola una referencia entre registros.';
  } else if (error.code === '9007' || error.code === '8022') {
    estado = 503;
    codigo = 'BASE_OCUPADA';
    mensaje = 'La base de datos está ocupada, reintentá en unos segundos.';
  }

  if (estado >= 500) {
    console.error('[error]', codigo, error.message);
    if (!env.esProduccion && error.stack) console.error(error.stack);
    if (!error.mensaje && !(error instanceof ApiError)) {
      mensaje = env.esProduccion ? 'Error interno del servidor.' : error.message;
    }
  }

  res.status(estado).json({
    ok: false,
    error: { codigo, mensaje, ...(detalles ? { detalles } : {}) }
  });
}
