import { Strategy as FacebookStrategy } from 'passport-facebook';
import { getCredentials } from '../Config/providers.js';

export const id = 'facebook';
export const scope = ['email', 'public_profile'];

/**
 * Facebook puede no devolver email (permiso denegado o test users).
 * Si no viene, el flujo pasa por el formulario de completado de email.
 */
function normalize(profile) {
  const email = profile.emails?.[0];
  const json = profile._json ?? {};
  return {
    providerUserId: String(profile.id),
    email: email?.value ?? json.email ?? null,
    // Meta no expone un flag de email verificado.
    emailVerified: null,
    name: profile.displayName ?? json.name ?? null,
    avatarUrl:
      profile.photos?.[0]?.value ??
      `https://graph.facebook.com/${profile.id}/picture?type=large`,
  };
}

export function createStrategy() {
  const { clientId, clientSecret, callbackUrl } = getCredentials(id);

  return new FacebookStrategy(
    {
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      scope,
      profileFields: ['id', 'displayName', 'emails', 'photos'],
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
