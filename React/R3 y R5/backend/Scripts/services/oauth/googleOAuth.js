import axios from 'axios';
import env from '../../config/env.js';
import { oauthState, findOrCreateOAuthUser, buildTokensAndRedirect, getFrontendRedirect } from './common.js';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export function buildAuthUrl(req, res) {
  const cfg = env.oauth.google;
  if (!cfg.clientId) return null;
  const redirect = getFrontendRedirect(req);
  const state = oauthState.generate('google', redirect);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(req, res, next) {
  try {
    const cfg = env.oauth.google;
    const { code, state, error } = req.query;
    const saved = oauthState.validate(state);
    if (!saved || saved.provider !== 'google' || error || !code) {
      return res.redirect(`${env.frontendUrl}/login?oauth_error=google`);
    }

    const tokenResp = await axios.post(TOKEN_URL, null, {
      params: {
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code,
        redirect_uri: cfg.callbackUrl,
        grant_type: 'authorization_code',
      },
    });

    const accessToken = tokenResp.data.access_token;
    const refreshToken = tokenResp.data.refresh_token;
    const expiresAt = new Date(Date.now() + (tokenResp.data.expires_in || 3600) * 1000);

    const userResp = await axios.get(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = userResp.data;
    const user = await findOrCreateOAuthUser({
      provider: 'google',
      providerUserId: String(profile.sub),
      email: profile.email,
      displayName: profile.name || profile.email,
      avatarUrl: profile.picture,
      profileData: profile,
      accessToken,
      refreshToken,
      expiresAt,
    });
    return buildTokensAndRedirect(res, user, saved.redirect);
  } catch (err) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=google`);
  }
}

export default { buildAuthUrl, handleCallback };
