import jwt from 'jsonwebtoken';
import env from '../Config/env.js';

/**
 * Firma un token JWT.
 * @param {{ id: string, email: string }} payload
 */
export function signToken(payload) {
  return jwt.sign(
    { sub: payload.id, id: payload.id, email: payload.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (err) {
    return null;
  }
}
