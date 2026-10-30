import { createManualOAuthProvider } from './manualOAuth.js';

/**
 * X (Twitter) - OAuth 2.0 con PKCE (S256).
 *
 * No existe una estrategia Passport mantenida para X, así que el flujo se
 * implementa a mano. X NO devuelve email por API, por lo que este proveedor
 * siempre pasa por el formulario de completado de email del frontend.
 */
const xProvider = createManualOAuthProvider({
  id: 'x',
  scopes: ['tweet.read', 'users.read', 'offline.access'],
  authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  profileUrl: 'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
  // X exige Basic Auth (client_id:client_secret) para clientes confidenciales.
  tokenAuthMode: 'basic',
  usePkce: true,

  /** La respuesta de X viene envuelta en { data: {...} }. */
  normalizeProfile(userResponse) {
    const user = userResponse?.data ?? {};
    return {
      providerUserId: user.id ? String(user.id) : null,
      email: null,
      emailVerified: null,
      name: user.name ?? user.username ?? null,
      avatarUrl: user.profile_image_url ?? null,
    };
  },
});

export default xProvider;
