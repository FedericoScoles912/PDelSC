import { consumeState } from '../Config/oauthState.js';
import { buildFrontendUrl, normalizeSystem } from '../Config/frontendRedirect.js';

/**
 * Valida el parámetro `state` que devuelve el proveedor (protección CSRF):
 * debe existir, no estar vencido, corresponder al proveedor y se consume
 * una sola vez.
 *
 * Si falla, redirige al frontend con un código de error (para que se muestre
 * en el Modal propio) en lugar de devolver JSON en plena navegación.
 */
export function validateOAuthState(req, res, next) {
  const record = consumeState(req.query.state);
  const system = normalizeSystem(req.query.system);

  if (!record || record.provider !== req.provider) {
    return res.redirect(
      buildFrontendUrl({ system, path: '/auth/callback', params: { error: 'invalid_state' } })
    );
  }

  req.oauthState = record;
  return next();
}
