import axios from 'axios';
import { query, queryOne } from '../config/db.js';
import env from '../config/env.js';
import {
  signAccessToken,
  issueRefreshToken,
} from '../services/jwtService.js';
import { buildUserPayload } from '../services/validationService.js';

const OAUTH_STATE_KEY = 'oauth_state_key';

/**
 * Almacena/verifica un state para prevenir CSRF en OAuth.
 * En producción usar Redis; aquí usamos un Map simple en memoria con TTL.
 */
const stateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

function cleanupStates() {
  const now = Date.now();
  for (const [k, v] of stateStore.entries()) {
    if (now - v.createdAt > STATE_TTL_MS) stateStore.delete(k);
  }
}
setInterval(cleanupStates, 60 * 1000).unref();

function generateState(provider, redirect) {
  const state = `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  stateStore.set(state, { provider, redirect, createdAt: Date.now() });
  return state;
}

function validateState(state) {
  const data = stateStore.get(state);
  if (!data) return null;
  if (Date.now() - data.createdAt > STATE_TTL_MS) {
    stateStore.delete(state);
    return null;
  }
  stateStore.delete(state);
  return data;
}

/**
 * Busca o crea un usuario + cuenta OAuth. Devuelve el usuario.
 */
export async function findOrCreateOAuthUser({
  provider,
  providerUserId,
  email,
  displayName,
  avatarUrl,
  profileData,
  accessToken,
  refreshToken,
  expiresAt,
}) {
  const safeEmail = email?.toLowerCase() || null;

  const existingAccount = await queryOne(
    `SELECT user_id FROM oauth_accounts WHERE provider = ? AND provider_user_id = ? LIMIT 1`,
    [provider, providerUserId]
  );

  if (existingAccount) {
    await query(
      `UPDATE oauth_accounts
       SET access_token = ?, refresh_token = ?, expires_at = ?, profile_data = ?, updated_at = CURRENT_TIMESTAMP
       WHERE provider = ? AND provider_user_id = ?`,
      [accessToken || null, refreshToken || null, expiresAt || null,
       profileData ? JSON.stringify(profileData) : null, provider, providerUserId]
    );
    return queryOne(
      `SELECT id, email, username, display_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [existingAccount.user_id]
    );
  }

  let userId = null;

  if (safeEmail) {
    const existingUser = await queryOne(`SELECT id FROM users WHERE email = ? LIMIT 1`, [safeEmail]);
    if (existingUser) userId = existingUser.id;
  }

  if (!userId) {
    const insertResult = await query(
      `INSERT INTO users (email, display_name, avatar_url, password_hash)
       VALUES (?, ?, ?, NULL)`,
      [safeEmail, displayName || `Usuario ${provider}`, avatarUrl || null]
    );
    userId = String(insertResult.rows.insertId);
  }

  await query(
    `INSERT INTO oauth_accounts
     (user_id, provider, provider_user_id, access_token, refresh_token, expires_at, profile_data)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, provider, providerUserId, accessToken || null, refreshToken || null, expiresAt || null,
     profileData ? JSON.stringify(profileData) : null]
  );

  return queryOne(
    `SELECT id, email, username, display_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
}

export async function buildTokensAndRedirect(res, user, redirectAfter) {
  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const { token: refreshToken } = await issueRefreshToken(user.id);

  res.cookie(env.jwt.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const atB64 = Buffer.from(accessToken).toString('base64url');
  const userB64 = Buffer.from(JSON.stringify(buildUserPayload(user))).toString('base64url');
  const sep = encodeURIComponent('::');
  const safeRedirect = redirectAfter && /^[a-z0-9/_\-?=:]*$/i.test(redirectAfter) ? redirectAfter : '/dashboard';

  return res.redirect(`${env.frontendUrl}${safeRedirect}#at=${atB64}${sep}u=${userB64}`);
}

export function getFrontendRedirect(req) {
  const redirect = req.query.redirect;
  if (typeof redirect === 'string' && /^\/[a-zA-Z0-9/_\-?=&]*$/.test(redirect)) {
    return redirect;
  }
  return '/dashboard';
}

export const oauthState = {
  generate: generateState,
  validate: validateState,
  OAUTH_STATE_KEY,
};

export { axios };
