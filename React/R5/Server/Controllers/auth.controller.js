import bcrypt from 'bcryptjs';
import { pool } from '../Config/db.js';
import { signToken } from '../Config/jwt.js';

const SALT_ROUNDS = 10;

/** Devuelve solo los campos públicos de un usuario. */
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url ?? null,
    created_at: user.created_at ?? null,
  };
}

/**
 * POST /api/register
 * Crea un usuario con contraseña hasheada y devuelve un JWT.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const user = { id: result.insertId, name, email, avatar_url: null };
    const token = signToken(user);

    return res.status(201).json({ token, user: toPublicUser({ ...user }) });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/login
 * Valida credenciales contra el hash almacenado y devuelve un JWT.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, name, email, password, avatar_url, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];

    // Mismo mensaje si el usuario no existe, no tiene contraseña (solo social)
    // o la contraseña es incorrecta: evita enumerar cuentas.
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signToken(user);
    return res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/logout
 * El JWT es stateless: el cliente descarta el token. El endpoint existe
 * para cerrar la sesión de forma explícita desde el frontend.
 */
export async function logout(req, res) {
  return res.json({ message: 'Sesión cerrada.' });
}
