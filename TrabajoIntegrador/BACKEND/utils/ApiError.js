/**
 * ApiError.js
 * Error de aplicación con código HTTP. El middleware de errores lo traduce a JSON.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {object} [details]
   */
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(msg = 'Solicitud inválida', details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'No autenticado') { return new ApiError(401, msg); }
  static forbidden(msg = 'No autorizado') { return new ApiError(403, msg); }
  static notFound(msg = 'Recurso no encontrado') { return new ApiError(404, msg); }
  static conflict(msg = 'Conflicto con el estado actual') { return new ApiError(409, msg); }
  static unprocessable(msg = 'Datos no procesables', details) { return new ApiError(422, msg, details); }
  static internal(msg = 'Error interno del servidor') { return new ApiError(500, msg); }
}

export default ApiError;
