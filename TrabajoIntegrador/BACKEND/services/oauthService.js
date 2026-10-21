/**
 * oauthService.js
 * Verificación de tokens de proveedores sociales (Google, Facebook, GitHub).
 * El frontend (Expo) obtiene el token del proveedor y lo envía al backend,
 * que lo valida contra el endpoint del proveedor y devuelve un perfil normalizado.
 */
import axios from 'axios';
import ApiError from '../utils/ApiError.js';

/** @typedef {{ providerUserId:string, email:string|null, nombre:string, apellido:string, proveedor:string }} PerfilSocial */

async function verificarGoogle(accessToken) {
  const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return {
    proveedor: 'google',
    providerUserId: data.sub,
    email: data.email || null,
    nombre: data.given_name || (data.name || '').split(' ')[0] || 'Usuario',
    apellido: data.family_name || (data.name || '').split(' ').slice(1).join(' ') || 'Google',
  };
}

async function verificarFacebook(accessToken) {
  const { data } = await axios.get('https://graph.facebook.com/me', {
    params: { fields: 'id,name,email,first_name,last_name', access_token: accessToken },
  });
  return {
    proveedor: 'facebook',
    providerUserId: data.id,
    email: data.email || null,
    nombre: data.first_name || data.name || 'Usuario',
    apellido: data.last_name || 'Facebook',
  };
}

async function verificarGithub(accessToken) {
  const { data: user } = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
  });
  let email = user.email;
  if (!email) {
    try {
      const { data: emails } = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
      });
      email = emails.find((e) => e.primary)?.email || emails[0]?.email || null;
    } catch {
      email = null;
    }
  }
  const [nombre, ...resto] = (user.name || user.login || 'Usuario').split(' ');
  return {
    proveedor: 'github',
    providerUserId: String(user.id),
    email,
    nombre: nombre || 'Usuario',
    apellido: resto.join(' ') || 'GitHub',
  };
}

const VERIFICADORES = { google: verificarGoogle, facebook: verificarFacebook, github: verificarGithub };

/**
 * @param {'google'|'facebook'|'github'} proveedor
 * @param {string} accessToken token obtenido por el cliente
 * @returns {Promise<PerfilSocial>}
 */
export async function verificarTokenSocial(proveedor, accessToken) {
  const verificador = VERIFICADORES[proveedor];
  if (!verificador) throw ApiError.badRequest(`Proveedor social no soportado: ${proveedor}`);
  if (!accessToken) throw ApiError.badRequest('Falta el access token del proveedor');
  try {
    return await verificador(accessToken);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized(`No se pudo validar el token de ${proveedor}`);
  }
}

export default { verificarTokenSocial };
