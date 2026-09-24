import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';
import { query, queryOne } from '../config/db.js';
import { hashPassword, comparePassword } from './passwordService.js';

/**
 * Firma un access token (JWT de corta duración).
 * @param {{ id: string, email: string }} payload
 */
export function signAccessToken(payload) {
  return jwt.sign(
    { type: 'access', ...payload },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

/**
 * Genera un refresh token aleatorio, lo hashea y lo almacena en la DB.
 * Devuelve el token en texto plano (única oportunidad de verlo).
 */
export async function issueRefreshToken(userId, meta = {}) {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresIn =
    (env.jwt.refreshExpiresIn.endsWith('d')
      ? parseInt(env.jwt.refreshExpiresIn, 10) * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000);

  const expiresAt = new Date(Date.now() + expiresIn);

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, meta.userAgent || null, meta.ipAddress || null, expiresAt]
  );

  return { token: rawToken, expiresAt };
}

/**
 * Verifica y rota un refresh token (buena práctica: un refresh token se usa una sola vez).
 * @param {string} rawToken - Token recibido desde la cookie httpOnly
 * @param {object} meta
 * @returns {Promise<{userId:string, newToken:string}|null>}
 */
export async function consumeRefreshToken(rawToken, meta = {}) {
  if (!rawToken) return null;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await queryOne(
    `SELECT id, user_id, is_revoked, expires_at
     FROM refresh_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash]
  );

  if (!record) return null;
  if (record.is_revoked) {
    // Posible token reuse attack: revocar todos los tokens de este usuario
    await query(
      `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?`,
      [record.user_id]
    );
    return null;
  }
  if (new Date(record.expires_at) < new Date()) {
    await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = ?`, [record.id]);
    return null;
  }

  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = ?`, [record.id]);
  const { token: newToken } = await issueRefreshToken(record.user_id, meta);
  return { userId: record.user_id, newToken };
}

/**
 * Revoca todos los refresh tokens de un usuario (logout global).
 */
export async function revokeAllRefreshTokens(userId) {
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?`, [userId]);
}

/**
 * Revoca un refresh token específico por su valor raw (logout dispositivo actual).
 */
export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await query(`UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = ?`, [tokenHash]);
}

/**
 * Verifica y decodifica un access token (JWT).
 * @param {string} token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch (err) {
    return null;
  }
}

export { hashPassword, comparePassword };
