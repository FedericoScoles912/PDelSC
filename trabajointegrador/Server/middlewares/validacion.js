/**
 * @file Middlewares de validación con Zod (cuerpo, query y params).
 * @module Server/middlewares/validacion
 */

/**
 * Valida `req.body` contra un esquema Zod y reemplaza el cuerpo por el resultado tipado.
 * @param {import('zod').ZodTypeAny} esquema
 * @returns {import('express').RequestHandler}
 */
export function validarBody(esquema) {
  return (req, _res, next) => {
    const resultado = esquema.safeParse(req.body);
    if (!resultado.success) return next(resultado.error);
    req.body = resultado.data;
    return next();
  };
}

/**
 * Valida `req.query` contra un esquema Zod y reemplaza el query por el resultado tipado.
 * @param {import('zod').ZodTypeAny} esquema
 * @returns {import('express').RequestHandler}
 */
export function validarQuery(esquema) {
  return (req, _res, next) => {
    const resultado = esquema.safeParse(req.query);
    if (!resultado.success) return next(resultado.error);
    req.query = resultado.data;
    return next();
  };
}

/**
 * Valida `req.params` contra un esquema Zod.
 * @param {import('zod').ZodTypeAny} esquema
 * @returns {import('express').RequestHandler}
 */
export function validarParams(esquema) {
  return (req, _res, next) => {
    const resultado = esquema.safeParse(req.params);
    if (!resultado.success) return next(resultado.error);
    req.params = resultado.data;
    return next();
  };
}
