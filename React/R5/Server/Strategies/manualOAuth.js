import { getCredentials } from '../Config/providers.js';

/**
 * Fábrica para proveedores OAuth 2.0 que NO tienen una estrategia Passport
 * mantenida (hoy: X y Discord). Implementa el flujo estándar a mano,
 * usando `fetch` nativo:
 *
 *   buildAuthorizationUrl() -> redirect al proveedor
 *   exchangeCodeForToken()  -> canjea code (opcionalmente + code_verifier) por token
 *   fetchUserProfile()      -> devuelve el perfil crudo del proveedor
 *
 * @param {object} config
 *  - id:              identificador del proveedor (coincide con las env vars)
 *  - scopes:          array de scopes a solicitar
 *  - authorizeUrl:    endpoint de autorización
 *  - tokenUrl:        endpoint de canje de token
 *  - profileUrl:      endpoint del perfil del usuario
 *  - tokenAuthMode:   'body' (client_id/secret en el cuerpo) | 'basic' (Basic Auth)
 *  - usePkce:         si el proveedor exige PKCE (S256)
 *  - normalizeProfile: (respuestaCruda) -> perfil interno normalizado
 */
export function createManualOAuthProvider({
  id,
  scopes,
  authorizeUrl,
  tokenUrl,
  profileUrl,
  tokenAuthMode = 'body',
  usePkce = false,
  normalizeProfile,
}) {
  /** URL a la que se redirige al usuario para autorizar la aplicación. */
  function buildAuthorizationUrl({ state, codeChallenge }) {
    const { clientId, callbackUrl } = getCredentials(id);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: scopes.join(' '),
      state,
    });

    if (usePkce && codeChallenge) {
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    return `${authorizeUrl}?${params.toString()}`;
  }

  /** Canjea el authorization code por un access token. */
  async function exchangeCodeForToken({ code, codeVerifier }) {
    const { clientId, clientSecret, callbackUrl } = getCredentials(id);

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: callbackUrl,
    });

    if (usePkce && codeVerifier) {
      body.set('code_verifier', codeVerifier);
    }

    if (tokenAuthMode === 'basic' && clientSecret) {
      // Cliente confidencial que exige Basic Auth (X).
      headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    } else {
      // Credenciales en el cuerpo (Discord y clientes públicos).
      body.set('client_id', clientId);
      if (clientSecret) body.set('client_secret', clientSecret);
    }

    const response = await fetch(tokenUrl, { method: 'POST', headers, body });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${id}: no se pudo canjear el código (${response.status}). ${detail}`);
    }

    return response.json();
  }

  /** Obtiene el perfil del usuario autenticado. */
  async function fetchUserProfile(accessToken) {
    const response = await fetch(profileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${id}: no se pudo obtener el perfil (${response.status}). ${detail}`);
    }

    return response.json();
  }

  return {
    id,
    scopes,
    usePkce,
    buildAuthorizationUrl,
    exchangeCodeForToken,
    fetchUserProfile,
    normalize: normalizeProfile,
  };
}
