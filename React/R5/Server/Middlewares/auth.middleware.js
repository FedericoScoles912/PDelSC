import { verifyToken } from '../Config/jwt.js';

/**
 * Exige un JWT válido en el header `Authorization: Bearer <token>`.
 * Si es válido, deja `req.user = { id, email }` disponible para los
 * controllers.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'No autorizado: falta el token.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return res
      .status(401)
      .json({ message: 'Sesión inválida o expirada. Volvé a iniciar sesión.' });
  }
}
