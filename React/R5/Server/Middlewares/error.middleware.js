/**
 * 404 para rutas no registradas.
 */
export function notFound(req, res) {
  res.status(404).json({ message: 'Recurso no encontrado.' });
}

/**
 * Manejador central de errores. Nunca expone detalles internos en 500.
 */
export function errorHandler(err, req, res, next) {
  // Body JSON malformado enviado por el cliente.
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es JSON válido.' });
  }

  const status = err?.status || err?.statusCode || 500;

  if (status >= 500) {
    console.error('[error]', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }

  return res.status(status).json({ message: err.message || 'Error en la petición.' });
}
