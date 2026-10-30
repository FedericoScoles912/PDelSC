/**
 * @file Utilidades HTTP compartidas: error tipado, respuestas y wrapper async.
 * @module Server/utils/http
 */

/**
 * Error de aplicación con estado HTTP y código de negocio.
 * @extends Error
 */
export class ApiError extends Error {
  /**
   * @param {number} estado Código HTTP.
   * @param {string} codigo Código de negocio (SCREAMING_SNAKE_CASE).
   * @param {string} mensaje Mensaje legible para el usuario.
   * @param {Array<*>|Object|null} [detalles] Detalle opcional (validaciones, conflictos).
   */
  constructor(estado, codigo, mensaje, detalles = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  static solicitudInvalida(mensaje, detalles = null) {
    return new ApiError(400, 'SOLICITUD_INVALIDA', mensaje, detalles);
  }

  static noAutorizado(mensaje = 'No autenticado.', codigo = 'NO_AUTENTICADO') {
    return new ApiError(401, codigo, mensaje);
  }

  static prohibido(mensaje = 'No tenés permiso para realizar esta acción.') {
    return new ApiError(403, 'SIN_PERMISO', mensaje);
  }

  static noEncontrado(mensaje = 'Recurso no encontrado.') {
    return new ApiError(404, 'NO_ENCONTRADO', mensaje);
  }

  static conflicto(mensaje, detalles = null) {
    return new ApiError(409, 'CONFLICTO', mensaje, detalles);
  }

  static interno(mensaje = 'Error interno del servidor.') {
    return new ApiError(500, 'ERROR_INTERNO', mensaje);
  }
}

/**
 * Envía una respuesta exitosa uniforme.
 * @param {import('express').Response} res
 * @param {*} datos
 * @param {Object|null} [meta]
 * @param {number} [estado]
 * @returns {import('express').Response}
 */
export function responder(res, datos, meta = null, estado = 200) {
  const cuerpo = { ok: true, datos };
  if (meta) cuerpo.meta = meta;
  return res.status(estado).json(cuerpo);
}

/**
 * Envía una respuesta 201 (creado).
 * @param {import('express').Response} res
 * @param {*} datos
 * @returns {import('express').Response}
 */
export function responderCreado(res, datos) {
  return responder(res, datos, null, 201);
}

/**
 * Envuelve un handler async para que sus rechazos lleguen al manejador de errores.
 * @param {Function} fn
 * @returns {Function}
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
