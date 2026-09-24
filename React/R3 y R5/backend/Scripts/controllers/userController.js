import { query, queryOne } from '../config/db.js';
import {
  validateDisplayName,
  validateUsername,
  validatePassword,
  buildUserPayload,
} from '../services/validationService.js';
import { hashPassword } from '../services/passwordService.js';

/**
 * GET /api/user/me
 */
export async function getMe(req, res, next) {
  try {
    const user = await queryOne(
      `SELECT id, email, username, display_name, avatar_url, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    const oauthAccounts = await query(
      `SELECT provider, provider_user_id, created_at FROM oauth_accounts WHERE user_id = ?`,
      [req.user.id]
    );
    return res.json({
      ok: true,
      user: {
        ...buildUserPayload(user),
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      linkedAccounts: oauthAccounts.rows.map((r) => ({
        provider: r.provider,
        providerUserId: r.provider_user_id,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/user/me
 * Body: { displayName?, username? }
 */
export async function updateMe(req, res, next) {
  try {
    const { displayName, username } = req.body || {};
    const fields = [];
    const values = [];
    const errors = {};

    if (displayName !== undefined) {
      const v = validateDisplayName(displayName);
      if (!v.valid) errors.displayName = v.error;
      else { fields.push('display_name = ?'); values.push(v.value); }
    }
    if (username !== undefined) {
      const v = validateUsername(username);
      if (!v.valid) errors.username = v.error;
      else {
        if (v.value) {
          const dup = await queryOne(`SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1`, [v.value, req.user.id]);
          if (dup) errors.username = 'Username ya está en uso';
          else { fields.push('username = ?'); values.push(v.value); }
        } else {
          fields.push('username = ?'); values.push(null);
        }
      }
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', details: errors });
    }
    if (!fields.length) {
      return res.json({ ok: true, user: req.user });
    }
    values.push(req.user.id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const updated = await queryOne(
      `SELECT id, email, username, display_name, avatar_url FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    return res.json({ ok: true, user: buildUserPayload(updated) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/user/change-password
 * Body: { currentPassword, newPassword, confirmPassword }
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const user = await queryOne(`SELECT id, password_hash FROM users WHERE id = ? LIMIT 1`, [req.user.id]);
    const errors = {};

    if (!user?.password_hash) {
      errors._ = 'Esta cuenta no tiene contraseña (creada con OAuth). Podés establecerla desde el perfil.';
    } else {
      const { comparePassword } = await import('../services/passwordService.js');
      const match = await comparePassword(currentPassword || '', user.password_hash);
      if (!match) errors.currentPassword = 'Contraseña actual incorrecta';
    }

    const vNew = validatePassword(newPassword);
    if (!vNew.valid) errors.newPassword = vNew.error;
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';

    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', details: errors });
    }

    const hash = await hashPassword(vNew.value);
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, req.user.id]);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
