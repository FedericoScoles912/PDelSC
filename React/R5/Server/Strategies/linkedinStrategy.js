import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { getCredentials } from '../Config/providers.js';

export const id = 'linkedin';
// LinkedIn migró a OpenID Connect: los scopes legacy (r_liteprofile /
// r_emailaddress) ya no funcionan salvo con apps antiguas.
export const scope = ['openid', 'profile', 'email'];

function normalize(profile) {
  const json = profile._json ?? {};
  const email = profile.emails?.[0]?.value ?? json.email ?? null;
  return {
    providerUserId: String(profile.id),
    email,
    emailVerified: json.email_verified ?? null,
    name: profile.displayName ?? json.name ?? null,
    avatarUrl: profile.photos?.[0]?.value ?? json.picture ?? null,
  };
}

export function createStrategy() {
  const { clientId, clientSecret, callbackUrl } = getCredentials(id);

  return new LinkedInStrategy(
    {
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      scope,
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
