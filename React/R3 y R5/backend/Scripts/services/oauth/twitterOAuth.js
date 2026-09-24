import axios from 'axios';
import env from '../../config/env.js';
import { oauthState, findOrCreateOAuthUser, buildTokensAndRedirect, getFrontendRedirect } from './common.js';
import crypto from 'crypto';

const AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const ME_URL = 'https://api.twitter.com/2/users/me';

const CHALLENGE_STORE_TTL = 10 * 60 * 1000;
const challengeStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of challengeStore.entries()) {
    if (now - v.createdAt > CHALLENGE_STORE_TTL) challengeStore.delete(k);
  }
}, 60 * 1000).unref();

function base64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function buildAuthUrl(req, res) {
  const cfg = env.oauth.twitter;
  if (!cfg.clientId) return null;
  const redirect = getFrontendRedirect(req);
  const state = oauthState.generate('twitter', redirect);
  const verifier = base64Url(crypto.randomBytes(32));
  const challenge = base64Url(crypto.createHash('sha256').update(verifier).digest());
  challengeStore.set(state, { verifier, createdAt: Date.now() });
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.callbackUrl,
    response_type: 'code',
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function handleCallback(req, res, next) {
  try {
    const cfg = env.oauth.twitter;
    const { code, state, error } = req.query;
    const saved = oauthState.validate(state);
    const challengeData = challengeStore.get(state);
    challengeStore.delete(state);
    if (!saved || saved.provider !== 'twitter' || error || !code || !challengeData) {
      return res.redirect(`${env.frontendUrl}/login?oauth_error=twitter`);
    }

    const authHeader = 'Basic ' + Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
    const tokenResp = await axios.post(TOKEN_URL, new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: cfg.clientId,
      redirect_uri: cfg.callbackUrl,
      code_verifier: challengeData.verifier,
    }), {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const accessToken = tokenResp.data.access_token;
    const refreshToken = tokenResp.data.refresh_token;
    const expiresAt = new Date(Date.now() + (tokenResp.data.expires_in || 7200) * 1000);

    const meResp = await axios.get(ME_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { 'user.fields': 'profile_image_url,username,name' },
    });
    const profile = meResp.data.data;
    const user = await findOrCreateOAuthUser({
      provider: 'twitter',
      providerUserId: String(profile.id),
      email: null,
      displayName: profile.name || profile.username,
      avatarUrl: profile.profile_image_url,
      profileData: profile,
      accessToken,
      refreshToken,
      expiresAt,
    });
    return buildTokensAndRedirect(res, user, saved.redirect);
  } catch (err) {
    return res.redirect(`${env.frontendUrl}/login?oauth_error=twitter`);
  }
}
export default { buildAuthUrl, handleCallback };
