/**
 * jwt.js
 * Firma y verificación de access/refresh tokens.
 */
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Firma el access token (vida corta).
 * @param {{id:number, email:string, rol:string}} payload
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

/**
 * Firma el refresh token (vida larga). Lleva un jti para poder revocarlo.
 * @param {{id:number}} payload
 */
export const signRefreshToken = (payload) =>
  jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });

/** @returns {object} payload verificado (lanza si es inválido/expirado) */
export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/** Hash determinista del refresh token para almacenarlo sin exponerlo. */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
