import { Router } from 'express';
import env from '../config/env.js';
import googleOAuth from '../services/oauth/googleOAuth.js';
import metaOAuth from '../services/oauth/metaOAuth.js';
import githubOAuth from '../services/oauth/githubOAuth.js';
import twitterOAuth from '../services/oauth/twitterOAuth.js';
import discordOAuth from '../services/oauth/discordOAuth.js';
import twitchOAuth from '../services/oauth/twitchOAuth.js';

const router = Router();

const providers = {
  google: googleOAuth,
  meta: metaOAuth,
  github: githubOAuth,
  twitter: twitterOAuth,
  discord: discordOAuth,
  twitch: twitchOAuth,
};

/**
 * GET /api/oauth/:provider
 * Redirige al flujo de OAuth del proveedor.
 * Query param opcional: ?redirect=/dashboard
 */
router.get('/:provider', (req, res) => {
  const providerName = String(req.params.provider || '').toLowerCase();
  const provider = providers[providerName];
  if (!provider) {
    return res.status(400).json({ ok: false, error: `Proveedor "${providerName}" no soportado` });
  }
  const authUrl = provider.buildAuthUrl(req, res);
  if (!authUrl) {
    return res.status(501).json({
      ok: false,
      error: `Proveedor "${providerName}" no configurado. Configurá las credenciales en el archivo .env del backend.`,
    });
  }
  return res.redirect(authUrl);
});

/**
 * GET /api/oauth/:provider/callback
 * Callback del proveedor OAuth.
 */
router.get('/:provider/callback', (req, res, next) => {
  const providerName = String(req.params.provider || '').toLowerCase();
  const provider = providers[providerName];
  if (!provider) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=unknown`);
  }
  return provider.handleCallback(req, res, next);
});

/**
 * GET /api/oauth/providers
 * Devuelve la lista de proveedores disponibles (configurados en .env).
 */
router.get('/', (req, res) => {
  const list = Object.entries(providers).map(([name, p]) => ({
    name,
    configured: p.buildAuthUrl({ query: {} }) !== null,
  }));
  res.json({ ok: true, providers: list });
});

export default router;
