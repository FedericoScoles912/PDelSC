import { Strategy as GitHubStrategy } from 'passport-github2';
import { getCredentials } from '../Config/providers.js';

export const id = 'github';
// user:email es necesario para obtener el email (y su flag verified) cuando
// el usuario lo tiene oculto en el perfil público.
export const scope = ['read:user', 'user:email'];

/**
 * GitHub suele devolver email = null si el usuario lo tiene privado.
 * Con el scope user:email, passport-github2 completa profile.emails.
 */
function normalize(profile) {
  const email = profile.emails?.[0];
  return {
    providerUserId: String(profile.id),
    email: email?.value ?? null,
    emailVerified: email?.verified ?? null,
    name: profile.displayName ?? profile.username ?? null,
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

export function createStrategy() {
  const { clientId, clientSecret, callbackUrl } = getCredentials(id);

  return new GitHubStrategy(
    {
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      scope,
      // Necesario para que la estrategia consulte /user/emails.
      allRawEmails: false,
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        done(null, { provider: id, normalized: normalize(profile) });
      } catch (error) {
        done(error);
      }
    }
  );
}
