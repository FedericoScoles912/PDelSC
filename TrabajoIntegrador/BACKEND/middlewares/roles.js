/**
 * roles.js
 * Autorización por rol. Se usa después de authRequired.
 * Ej: router.post('/', authRequired, roleRequired('Administrador'), ctrl.crear)
 */
import ApiError from '../utils/ApiError.js';

/** Nombres de rol tal como se guardan en la tabla `roles`. */
export const ROLES = {
  ADMIN: 'Administrador',
  DEPOSITO: 'Encargado de Deposito',
  VENDEDOR: 'Vendedor',
};

/**
 * @param {...string} roles Nombres de rol permitidos
 */
export const roleRequired = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.rol)) {
    return next(ApiError.forbidden(`El rol "${req.user.rol}" no tiene permisos para esta acción`));
  }
  return next();
};

export default roleRequired;
