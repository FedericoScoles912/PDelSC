import axios from 'axios';
import env from '../../config/env.js';
import { oauthState, findOrCreateOAuthUser, buildTokensAndRedirect, getFrontendRedirect } from './common.js';

const AUTH_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const USER_URL = 'https://api.github.com/user';
const EMAILS_URL = 'https://api.github.com/user/emails';

export function buildAuthUrl(req, res) {
  const cfg = env.oauth.github;
  if (!cfg.clientId) return null;
  const redirect = getFrontendRedirect(req);
  const state = oauthState.generate('github', redirect);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    response_type: 'code',
    scope: 'user:email read:user',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(req, res, next) {
  try {
    const cfg = env.oauth.github;
    const { code, state, error } = req.query;
    const saved = oauthState.validate(state);
    if (!saved || saved.provider !== 'github' || error || !code) {
      return res.redirect(`${env.frontendUrl}/login?oauth_error=github`);
    }
    const tokenResp = await axios.post(TOKEN_URL, {
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      redirect_uri: cfg.callbackUrl,
    }, {
      headers: { Accept: 'application/json' },
    });
    const accessToken = tokenResp.data.access_token;
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };

    const meResp = await axios.get(USER_URL, { headers });
    const profile = meResp.data;
    let email = profile.email;
    if (!email) {
      try {
        const emailsResp = await axios.get(EMAILS_URL, { headers });
        const primary = emailsResp.data.find((e) => e.primary && e.verified) || emailsResp.data[0];
        email = primary?.email;
      } catch (_) { /* ignore */ }
    }
    const user = await findOrCreateOAuthUser({
      provider: 'github',
      providerUserId: String(profile.id),
      email,
      displayName: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      profileData: profile,
      accessToken,
    });
    return buildTokensAndRedirect(res, user, saved.redirect);
  } catch (err) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=github`);
  }
}
export default { buildAuthUrl, handleCallback };
