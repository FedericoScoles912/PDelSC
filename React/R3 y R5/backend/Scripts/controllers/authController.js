import { query, queryOne } from '../config/db.js';
import env from '../config/env.js';
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  issueRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
} from '../services/jwtService.js';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateDisplayName,
  validateUsername,
  buildUserPayload,
} from '../services/validationService.js';

function getClientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.ip ||
    null
  );
}

function getClientMeta(req) {
  return {
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
  };
}

function setRefreshCookie(res, tokenValue) {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  res.cookie(env.jwt.refreshCookieName, tokenValue, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api',
    maxAge: maxAgeMs,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(env.jwt.refreshCookieName, { path: '/api', httpOnly: true, sameSite: 'lax' });
}

/**
 * POST /api/auth/register
 * Body: { email, password, confirmPassword, displayName, username? }
 */
export async function register(req, res, next) {
  try {
    const { email, password, confirmPassword, displayName, username } = req.body || {};

    const vEmail = validateEmail(email);
    const vPass = validatePassword(password);
    const vConfirm = validatePasswordConfirmation(confirmPassword, password);
    const vName = validateDisplayName(displayName);
    const vUser = validateUsername(username);

    const errors = {};
    if (!vEmail.valid) errors.email = vEmail.error;
    if (!vPass.valid) errors.password = vPass.error;
    if (!vConfirm.valid) errors.confirmPassword = vConfirm.error;
    if (!vName.valid) errors.displayName = vName.error;
    if (!vUser.valid) errors.username = vUser.error;
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', details: errors });
    }

    const existing = await queryOne(`SELECT id FROM users WHERE email = ? LIMIT 1`, [vEmail.value]);
    if (existing) {
      return res.status(409).json({ ok: false, error: 'El email ya está registrado' });
    }

    if (vUser.value) {
      const existingUser = await queryOne(`SELECT id FROM users WHERE username = ? LIMIT 1`, [vUser.value]);
      if (existingUser) {
        return res.status(409).json({ ok: false, error: 'El username ya está en uso' });
      }
    }

    const hashed = await hashPassword(vPass.value);

    const result = await query(
      `INSERT INTO users (email, username, password_hash, display_name)
       VALUES (?, ?, ?, ?)`,
      [vEmail.value, vUser.value || null, hashed, vName.value]
    );
    const userId = String(result.rows.insertId);

    const user = await queryOne(
      `SELECT id, email, username, display_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const meta = getClientMeta(req);
    const accessToken = signAccessToken({ id: userId, email: user.email });
    const { token: refreshToken } = await issueRefreshToken(userId, meta);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      ok: true,
      accessToken,
      user: buildUserPayload(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const vEmail = validateEmail(email);
    const vPass = validatePassword(password);
    const errors = {};
    if (!vEmail.valid) errors.email = vEmail.error;
    if (!vPass.valid) errors.password = vPass.error;
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', details: errors });
    }

    const user = await queryOne(
      `SELECT id, email, username, password_hash, display_name, avatar_url, is_active
       FROM users WHERE email = ? LIMIT 1`,
      [vEmail.value]
    );

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    if (!user.is_active) {
      return res.status(401).json({ ok: false, error: 'Cuenta inactiva' });
    }
    const match = await comparePassword(vPass.value, user.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    const meta = getClientMeta(req);
    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const { token: refreshToken } = await issueRefreshToken(user.id, meta);
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      ok: true,
      accessToken,
      user: buildUserPayload(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Usa el refresh token desde la cookie httpOnly.
 */
export async function refresh(req, res, next) {
  try {
    const raw = req.cookies?.[env.jwt.refreshCookieName] || null;
    const meta = getClientMeta(req);
    const consumed = await consumeRefreshToken(raw, meta);
    if (!consumed) {
      clearRefreshCookie(res);
      return res.status(401).json({ ok: false, error: 'Sesión expirada' });
    }
    const user = await queryOne(
      `SELECT id, email, username, display_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [consumed.userId]
    );
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });
    }
    const accessToken = signAccessToken({ id: user.id, email: user.email });
    setRefreshCookie(res, consumed.newToken);
    return res.json({ ok: true, accessToken, user: buildUserPayload(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Invalida el refresh token del dispositivo actual.
 */
export async function logout(req, res, next) {
  try {
    const raw = req.cookies?.[env.jwt.refreshCookieName] || null;
    await revokeRefreshToken(raw);
    clearRefreshCookie(res);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout-all
 * Invalida todos los refresh tokens del usuario.
 */
export async function logoutAll(req, res, next) {
  try {
    if (req.user?.id) {
      await revokeAllRefreshTokens(req.user.id);
    }
    clearRefreshCookie(res);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export { setRefreshCookie, buildUserPayload };
