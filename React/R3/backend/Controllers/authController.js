import { query, queryOne } from '../Config/db.js';
import env from '../Config/env.js';
import {
  hashPassword,
  comparePassword,
} from '../Services/passwordService.js';
import { signToken } from '../Services/jwtService.js';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateDisplayName,
  validateUsername,
  buildUserPayload,
} from '../Services/validationService.js';

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
    const userId = crypto.randomUUID();

    await query(
      `INSERT INTO users (id, email, username, password_hash, display_name)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, vEmail.value, vUser.value || null, hashed, vName.value]
    );

    const user = await queryOne(
      `SELECT id, email, username, display_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const token = signToken({ id: userId, email: user.email });

    return res.status(201).json({
      ok: true,
      user: buildUserPayload(user),
      token,
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

    const token = signToken({ id: user.id, email: user.email });

    return res.status(200).json({
      ok: true,
      user: buildUserPayload(user),
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}
