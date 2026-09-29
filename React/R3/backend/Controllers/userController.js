import { query, queryOne } from '../Config/db.js';
import {
  validateDisplayName,
  validateUsername,
  validatePassword,
  validatePasswordConfirmation,
  buildUserPayload,
} from '../Services/validationService.js';
import { hashPassword, comparePassword } from '../Services/passwordService.js';

function normalizeBody(body) {
  const result = {};
  if (!body) return result;
  const map = {
    display_name: 'displayName',
    avatar_url: 'avatarUrl',
    confirm_password: 'confirmPassword',
    current_password: 'currentPassword',
    new_password: 'newPassword',
  };
  for (const [key, value] of Object.entries(body)) {
    const mapped = map[key] || key;
    result[mapped] = value;
  }
  return result;
}

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
    return res.json({
      ok: true,
      user: {
        ...buildUserPayload(user),
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT/PATCH /api/user/me
 * Body: { displayName?, username?, avatarUrl?, password? }
 */
export async function updateMe(req, res, next) {
  try {
    const raw = normalizeBody(req.body || {});
    const { displayName, username, avatarUrl, password } = raw;
    let confirmPassword = raw.confirmPassword;

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
    if (avatarUrl !== undefined) {
      if (avatarUrl === null || avatarUrl === '') {
        fields.push('avatar_url = ?'); values.push(null);
      } else if (typeof avatarUrl === 'string' && avatarUrl.length <= 500) {
        fields.push('avatar_url = ?'); values.push(avatarUrl);
      } else {
        errors.avatarUrl = 'Avatar URL inválido';
      }
    }
    if (password !== undefined && password !== null) {
      const vPass = validatePassword(password);
      if (!vPass.valid) {
        errors.password = vPass.error;
      } else {
        if (confirmPassword !== undefined) {
          const vConfirm = validatePasswordConfirmation(confirmPassword, password);
          if (!vConfirm.valid) errors.confirmPassword = vConfirm.error;
        }
        if (!errors.password && !errors.confirmPassword) {
          const hashed = await hashPassword(vPass.value);
          fields.push('password_hash = ?');
          values.push(hashed);
        }
      }
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', details: errors });
    }
    if (!fields.length) {
      const current = await queryOne(
        `SELECT id, email, username, display_name, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1`,
        [req.user.id]
      );
      return res.json({
        ok: true,
        user: {
          ...buildUserPayload(current),
          createdAt: current.created_at,
          updatedAt: current.updated_at,
        },
      });
    }
    values.push(req.user.id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const updated = await queryOne(
      `SELECT id, email, username, display_name, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    return res.json({
      ok: true,
      user: {
        ...buildUserPayload(updated),
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
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
    const raw = normalizeBody(req.body || {});
    const { currentPassword, newPassword, confirmPassword } = raw;
    const user = await queryOne(`SELECT id, password_hash FROM users WHERE id = ? LIMIT 1`, [req.user.id]);
    const errors = {};

    const match = await comparePassword(currentPassword || '', user.password_hash || '');
    if (!match) errors.currentPassword = 'Contraseña actual incorrecta';

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
