import { verifyAccessToken } from '../services/jwtService.js';
import { queryOne } from '../config/db.js';

/**
 * Middleware: requiere un access token válido (vía Authorization header).
 * Inyecta req.user con la info básica.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    const decoded = token ? verifyAccessToken(token) : null;
    if (!decoded || !decoded.id) {
      return res.status(401).json({ ok: false, error: 'Sesión no autorizada' });
    }

    const user = await queryOne(
      `SELECT id, email, username, display_name, avatar_url, is_active
       FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ ok: false, error: 'Usuario no disponible' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: usuario opcional. Si hay token, carga req.user. Si no, sigue.
 */
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) return next();
    const user = await queryOne(
      `SELECT id, email, username, display_name, avatar_url, is_active FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );
    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
      };
    }
    next();
  } catch (err) {
    next(err);
  }
}
