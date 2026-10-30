import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getCredentials } from '../Config/providers.js';

export const id = 'google';
export const scope = ['profile', 'email'];

/** Adapta el perfil crudo de Google al formato interno común. */
function normalize(profile) {
  const email = profile.emails?.[0];
  return {
    providerUserId: String(profile.id),
    email: email?.value ?? null,
    emailVerified: email?.verified ?? null,
    name: profile.displayName ?? null,
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

export function createStrategy() {
  const { clientId, clientSecret, callbackUrl } = getCredentials(id);

  return new GoogleStrategy(
    { clientID: clientId, clientSecret, callbackURL: callbackUrl, scope },
    (accessToken, refreshToken, profile, done) => {
      try {
        done(null, { provider: id, normalized: normalize(profile) });
      } catch (error) {
        done(error);
      }
    }
  );
}
