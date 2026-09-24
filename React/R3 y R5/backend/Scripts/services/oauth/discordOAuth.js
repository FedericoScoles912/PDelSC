import axios from 'axios';
import env from '../../config/env.js';
import { oauthState, findOrCreateOAuthUser, buildTokensAndRedirect, getFrontendRedirect } from './common.js';

const AUTH_URL = 'https://discord.com/oauth2/authorize';
const TOKEN_URL = 'https://discord.com/api/oauth2/token';
const ME_URL = 'https://discord.com/api/users/@me';

export function buildAuthUrl(req, res) {
  const cfg = env.oauth.discord;
  if (!cfg.clientId) return null;
  const redirect = getFrontendRedirect(req);
  const state = oauthState.generate('discord', redirect);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    response_type: 'code',
    scope: 'identify email',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(req, res, next) {
  try {
    const cfg = env.oauth.discord;
    const { code, state, error } = req.query;
    const saved = oauthState.validate(state);
    if (!saved || saved.provider !== 'discord' || error || !code) {
      return res.redirect(`${env.frontendUrl}/login?oauth_error=discord`);
    }
    const tokenResp = await axios.post(TOKEN_URL, new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: cfg.callbackUrl,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const accessToken = tokenResp.data.access_token;
    const refreshToken = tokenResp.data.refresh_token;
    const expiresAt = new Date(Date.now() + (tokenResp.data.expires_in || 604800) * 1000);

    const meResp = await axios.get(ME_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = meResp.data;
    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : null;
    const email = profile.verified ? profile.email : null;
    const user = await findOrCreateOAuthUser({
      provider: 'discord',
      providerUserId: String(profile.id),
      email,
      displayName: profile.global_name || profile.username,
      avatarUrl,
      profileData: profile,
      accessToken,
      refreshToken,
      expiresAt,
    });
    return buildTokensAndRedirect(res, user, saved.redirect);
  } catch (err) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=discord`);
  }
}
export default { buildAuthUrl, handleCallback };
