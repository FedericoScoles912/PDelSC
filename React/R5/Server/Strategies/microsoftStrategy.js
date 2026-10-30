import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { getCredentials } from '../Config/providers.js';

export const id = 'microsoft';
export const scope = ['user.read'];

function normalize(profile) {
  const json = profile._json ?? {};
  const email = profile.emails?.[0]?.value ?? json.mail ?? json.userPrincipalName ?? null;
  return {
    providerUserId: String(profile.id),
    email,
    // Microsoft Graph devuelve direcciones verificadas del directorio.
    emailVerified: null,
    name: profile.displayName ?? json.displayName ?? null,
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

export function createStrategy() {
  const { clientId, clientSecret, callbackUrl } = getCredentials(id);

  return new MicrosoftStrategy(
    {
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      // 'common' permite cuentas personales y corporativas; podés restringirlo
      // a un tenant específico con MICROSOFT_TENANT_ID.
      tenant: process.env.MICROSOFT_TENANT_ID || 'common',
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
