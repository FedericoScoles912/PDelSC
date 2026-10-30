import { body, validationResult } from 'express-validator';

/**
 * Reglas de validación/sanitización por endpoint. Toda entrada que llegue
 * a la base de datos debe pasar primero por acá.
 */

export const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('El nombre debe tener entre 2 y 120 caracteres.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('El email no es válido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
];

export const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('El email no es válido.')
    .normalizeEmail(),
  body('password').isString().notEmpty().withMessage('La contraseña es obligatoria.'),
];

export const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('El nombre debe tener entre 2 y 120 caracteres.'),
  body('avatar_url')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('La URL del avatar no es válida.'),
  body('password')
    .optional({ values: 'falsy' })
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
];

/**
 * Reglas del canje del código temporal de OAuth. `email` es opcional: solo
 * hace falta cuando el proveedor no entregó el email y hay que completarlo.
 */
export const exchangeRules = [
  body('code')
    .isString()
    .isLength({ min: 32, max: 128 })
    .withMessage('El código de intercambio no es válido.'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('El email no es válido.')
    .normalizeEmail(),
];

/**
 * Recolecta los errores acumulados por las reglas y responde 400 con un
 * listado normalizado { field, message }.
 */
export function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos.',
      errors: result.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  return next();
}
