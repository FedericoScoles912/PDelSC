/**
 * Middleware global de captura y manejo de errores.
 * Retorna siempre una respuesta JSON consistente y no expone trazas en producción.
 */
export function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    ok: false,
    mensaje: message,
  });
}
