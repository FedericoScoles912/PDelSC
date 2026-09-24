import axios from 'axios';
import env from '../../config/env.js';
import { oauthState, findOrCreateOAuthUser, buildTokensAndRedirect, getFrontendRedirect } from './common.js';

const AUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const ME_URL = 'https://api.twitch.tv/helix/users';

export function buildAuthUrl(req, res) {
  const cfg = env.oauth.twitch;
  if (!cfg.clientId) return null;
  const redirect = getFrontendRedirect(req);
  const state = oauthState.generate('twitch', redirect);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    response_type: 'code',
    scope: 'user:read:email',
    state,
    force_verify: 'false',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(req, res, next) {
  try {
    const cfg = env.oauth.twitch;
    const { code, state, error } = req.query;
    const saved = oauthState.validate(state);
    if (!saved || saved.provider !== 'twitch' || error || !code) {
      return res.redirect(`${env.frontendUrl}/login?oauth_error=twitch`);
    }
    const tokenResp = await axios.post(TOKEN_URL, null, {
      params: {
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: cfg.callbackUrl,
      },
    });
    const accessToken = tokenResp.data.access_token;
    const refreshToken = tokenResp.data.refresh_token;
    const expiresAt = new Date(Date.now() + (tokenResp.data.expires_in || 14124) * 1000);

    const meResp = await axios.get(ME_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': cfg.clientId,
      },
    });
    const profile = meResp.data?.data?.[0];
    if (!profile) throw new Error('No profile');
    const user = await findOrCreateOAuthUser({
      provider: 'twitch',
      providerUserId: String(profile.id),
      email: profile.email,
      displayName: profile.display_name || profile.login,
      avatarUrl: profile.profile_image_url,
      profileData: profile,
      accessToken,
      refreshToken,
      expiresAt,
    });
    return buildTokensAndRedirect(res, user, saved.redirect);
  } catch (err) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=twitch`);
  }
}
export default { buildAuthUrl, handleCallback };
