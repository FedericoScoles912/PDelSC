import { createManualOAuthProvider } from './manualOAuth.js';

/**
 * Discord - OAuth 2.0 (flujo estándar de autorización).
 *
 * `passport-discord` está oficialmente deprecado (npm lo marca como "no
 * longer maintained"), así que el flujo se implementa a mano con la API
 * estándar de OAuth 2.0 en lugar de depender de un paquete sin soporte.
 */
const discordProvider = createManualOAuthProvider({
  id: 'discord',
  scopes: ['identify', 'email'],
  authorizeUrl: 'https://discord.com/oauth2/authorize',
  tokenUrl: 'https://discord.com/api/oauth2/token',
  profileUrl: 'https://discord.com/api/users/@me',
  // Discord espera client_id y client_secret en el cuerpo del request.
  tokenAuthMode: 'body',
  usePkce: false,

  /** Discord devuelve el usuario plano (sin envoltorio). */
  normalizeProfile(user) {
    const avatarUrl = user?.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : null;

    return {
      providerUserId: user?.id ? String(user.id) : null,
      email: user?.email ?? null,
      emailVerified: typeof user?.verified === 'boolean' ? user.verified : null,
      name: user?.global_name ?? user?.username ?? null,
      avatarUrl,
    };
  },
});

export default discordProvider;
