import crypto from 'crypto';
import express from 'express';

const router = express.Router();
const COOKIE_NAME = 'portfolio_admin_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'solo-para-desarrollo');
}

const configuredUsername = () => process.env.ADMIN_USERNAME || (process.env.NODE_ENV === 'production' ? '' : 'admin');
const configuredPassword = () => process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123');

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    return index === -1 ? [] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }).filter(([key]) => key));
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function validSession(token) {
  if (!token || !getSecret()) return false;
  const [payload, signature] = token.split('.');
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (!payload || !signature || expected.length !== received.length || !crypto.timingSafeEqual(received, expected)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).expires_at > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req, res, next) {
  if (!validSession(parseCookies(req.headers.cookie)[COOKIE_NAME])) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!configuredUsername() || !configuredPassword()) {
    return res.status(503).json({ error: 'Falta configurar ADMIN_USERNAME y ADMIN_PASSWORD en el entorno de producción.' });
  }
  const received = Buffer.from(password || '');
  const expected = Buffer.from(configuredPassword());
  const valid = username === configuredUsername()
    && received.length === expected.length
    && crypto.timingSafeEqual(received, expected);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas.' });

  const payload = Buffer.from(JSON.stringify({ expires_at: Date.now() + SESSION_DURATION_MS })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  });
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  res.json({ ok: true });
});

router.get('/session', (req, res) => res.json({ authenticated: validSession(parseCookies(req.headers.cookie)[COOKIE_NAME]) }));

export default router;
