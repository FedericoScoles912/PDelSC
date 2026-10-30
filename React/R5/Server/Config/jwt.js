import jwt from 'jsonwebtoken';
import { env } from './env.js';

/**
 * Firma un JWT. `sub` guarda el id del usuario, que es lo único que
 * necesita el middleware de autenticación.
 */
export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

/**
 * Verifica un JWT. Lanza si es inválido o expiró (el llamador decide
 * cómo responder).
 */
export function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}
