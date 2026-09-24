import axios from 'axios';
import env from '../../config/env.js';
import { oauthState, findOrCreateOAuthUser, buildTokensAndRedirect, getFrontendRedirect } from './common.js';

const AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
const ME_URL = 'https://graph.facebook.com/v18.0/me';

export function buildAuthUrl(req, res) {
  const cfg = env.oauth.meta;
  if (!cfg.clientId) return null;
  const redirect = getFrontendRedirect(req);
  const state = oauthState.generate('meta', redirect);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    response_type: 'code',
    scope: 'email public_profile',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(req, res, next) {
  try {
    const cfg = env.oauth.meta;
    const { code, state, error } = req.query;
    const saved = oauthState.validate(state);
    if (!saved || saved.provider !== 'meta' || error || !code) {
      return res.redirect(`${env.frontendUrl}/login?oauth_error=meta`);
    }
    const tokenResp = await axios.get(TOKEN_URL, {
      params: {
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: cfg.callbackUrl,
        code,
      },
    });
    const accessToken = tokenResp.data.access_token;
    const expiresAt = new Date(Date.now() + (tokenResp.data.expires_in || 3600) * 1000);

    const meResp = await axios.get(ME_URL, {
      params: {
        fields: 'id,name,email,picture.type(large)',
        access_token: accessToken,
      },
    });
    const profile = meResp.data;
    const user = await findOrCreateOAuthUser({
      provider: 'meta',
      providerUserId: String(profile.id),
      email: profile.email,
      displayName: profile.name || `Meta user ${profile.id}`,
      avatarUrl: profile.picture?.data?.url,
      profileData: profile,
      accessToken,
      expiresAt,
    });
    return buildTokensAndRedirect(res, user, saved.redirect);
  } catch (err) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=meta`);
  }
}
export default { buildAuthUrl, handleCallback };
