import bcrypt from 'bcryptjs';
import { pool } from '../Config/db.js';

const SALT_ROUNDS = 10;

/** Devuelve solo los campos públicos de un usuario. */
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url ?? null,
    created_at: user.created_at ?? null,
    updated_at: user.updated_at ?? null,
  };
}

/**
 * GET /api/profile  (protegido)
 */
export async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json({ user: toPublicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/profile  (protegido)
 * Actualiza solo los campos enviados. Las queries se arman con placeholders
 * (nunca concatenando valores del cliente).
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, avatar_url, password } = req.body;

    const assignments = [];
    const values = [];

    if (typeof name === 'string') {
      assignments.push('name = ?');
      values.push(name);
    }

    if (typeof avatar_url === 'string') {
      assignments.push('avatar_url = ?');
      values.push(avatar_url);
    }

    if (typeof password === 'string' && password.length > 0) {
      assignments.push('password = ?');
      values.push(await bcrypt.hash(password, SALT_ROUNDS));
    }

    if (assignments.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar.' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query(
      'SELECT id, name, email, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    return res.json({ user: toPublicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
}
