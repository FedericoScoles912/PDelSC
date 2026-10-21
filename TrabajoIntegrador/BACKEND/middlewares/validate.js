/**
 * validate.js
 * Validación de datos de entrada con Zod. Soporta body, query y params.
 */
import ApiError from '../utils/ApiError.js';

/**
 * @param {{body?:import('zod').ZodTypeAny, query?:import('zod').ZodTypeAny, params?:import('zod').ZodTypeAny}} schemas
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body);
    return next();
  } catch (err) {
    if (err?.issues) {
      const details = err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }));
      return next(ApiError.unprocessable('Datos inválidos', details));
    }
    return next(err);
  }
};

export default validate;
