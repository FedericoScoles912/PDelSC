import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import { getCredentials } from '../Config/providers.js';

export const id = 'twitch';
export const scope = ['user:read:email'];

/**
 * passport-twitch-new expone el email en profile.email (no en profile.emails).
 */
function normalize(profile) {
  const json = profile._json ?? {};
  const email = profile.email ?? profile.emails?.[0]?.value ?? json.email ?? null;
  return {
    providerUserId: String(profile.id),
    email,
    emailVerified: json.email_verified ?? null,
    name: profile.displayName ?? json.display_name ?? null,
    avatarUrl: json.profile_image_url ?? profile.photos?.[0]?.value ?? null,
  };
}

export function createStrategy() {
  const { clientId, clientSecret, callbackUrl } = getCredentials(id);

  return new TwitchStrategy(
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
