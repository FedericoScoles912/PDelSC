/**
 * @file Verificación de tokens de proveedores OAuth (Google/Facebook/GitHub)
 *       y vinculación o creación del usuario local correspondiente.
 * @module Server/servicios/oauth
 */

import { ejecutar, queryUna } from '../config/db.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

/** Proveedores sociales soportados. */
export const PROVEEDORES = ['google', 'facebook', 'github'];

/** Almacén temporal en memoria para emparejar el callback OAuth con el cliente (TTL 5 min). */
const estadosPendientes = new Map();

/**
 * Guarda el resultado de un flujo OAuth asociado a un `state`.
 * @param {string} state
 * @param {Object} payload
 */
export function guardarEstadoOAuth(state, payload) {
  if (!state) return;
  estadosPendientes.set(state, {
    ...payload,
    expiraEn: Date.now() + 5 * 60 * 1000
  });
}

/**
 * Consulta y consume (si ya finalizó) el estado de un flujo OAuth.
 * @param {string} state
 * @returns {Object|null}
 */
export function obtenerEstadoOAuth(state) {
  if (!state) return null;
  const item = estadosPendientes.get(state);
  if (!item) return null;
  if (Date.now() > item.expiraEn) {
    estadosPendientes.delete(state);
    return null;
  }
  return item;
}

/**
 * Obtiene el proveedor original asociado a un `state` sin consumir el estado pendiente.
 * @param {string} state
 * @returns {string|null}
 */
export function obtenerProveedorDeEstado(state) {
  if (!state) return null;
  const item = estadosPendientes.get(state);
  if (!item || Date.now() > item.expiraEn) return null;
  return item.proveedor ?? null;
}

/**
 * Construye la URL de callback registrada para el proveedor.
 * @param {'google'|'facebook'|'github'} proveedor
 * @returns {string}
 */
export function obtenerCallbackUrl(proveedor) {
  const base = (env.oauth.callbackBaseUrl || 'http://localhost:4000').replace(/\/+$/, '');
  return `${base}${env.apiPrefix}/auth/oauth/${proveedor}`;
}

/**
 * Construye la URL de autorización OAuth 2.0 real del proveedor.
 * @param {'google'|'facebook'|'github'} proveedor
 * @param {{state:string}} opciones
 * @returns {string}
 */
export function construirUrlAutorizacion(proveedor, { state }) {
  const redirectUri = obtenerCallbackUrl(proveedor);

  if (proveedor === 'google') {
    const clientId = env.oauth.google.clientId;
    if (!clientId) {
      throw ApiError.solicitudInvalida('Falta configurar GOOGLE_CLIENT_ID en el archivo .env.');
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
      state
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  if (proveedor === 'github') {
    const clientId = env.oauth.github.clientId;
    if (!clientId) {
      throw ApiError.solicitudInvalida('Falta configurar GITHUB_CLIENT_ID en el archivo .env.');
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  if (proveedor === 'facebook') {
    const clientId = env.oauth.facebook.clientId;
    if (!clientId) {
      throw ApiError.solicitudInvalida('Falta configurar FACEBOOK_CLIENT_ID en el archivo .env.');
    }
    // Si FACEBOOK_CLIENT_ID usa credenciales federadas de Google OAuth 2.0,
    // valida la identidad real contra Google OAuth 2.0 manteniendo el proveedor 'facebook' en `state`.
    if (clientId.endsWith('.apps.googleusercontent.com')) {
      const googleRedirectUri = obtenerCallbackUrl('google');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: googleRedirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
        state
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'public_profile,email',
      state
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  throw ApiError.solicitudInvalida('Proveedor OAuth no soportado.');
}

/**
 * Intercambia un `code` de autorización OAuth 2.0 por un access_token/id_token del proveedor.
 * @param {'google'|'facebook'|'github'} proveedor
 * @param {string} code
 * @returns {Promise<string>} Token para verificar perfil.
 */
export async function intercambiarCodigoPorToken(proveedor, code) {
  const redirectUri = obtenerCallbackUrl(proveedor);

  if (proveedor === 'google') {
    const { clientId, clientSecret } = env.oauth.google;
    if (!clientId || !clientSecret) {
      throw ApiError.solicitudInvalida('Faltan credenciales de Google OAuth en .env.');
    }
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });
    const datos = await resp.json();
    if (!resp.ok || (!datos.id_token && !datos.access_token)) {
      throw ApiError.noAutorizado(
        datos.error_description || datos.error || 'Error al canjear código con Google.'
      );
    }
    return datos.access_token || datos.id_token;
  }

  if (proveedor === 'github') {
    const { clientId, clientSecret } = env.oauth.github;
    if (!clientId || !clientSecret) {
      throw ApiError.solicitudInvalida('Faltan credenciales de GitHub OAuth en .env.');
    }
    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });
    const datos = await resp.json();
    if (!resp.ok || !datos.access_token) {
      throw ApiError.noAutorizado(
        datos.error_description || datos.error || 'Error al canjear código con GitHub.'
      );
    }
    return datos.access_token;
  }

  if (proveedor === 'facebook') {
    const { clientId, clientSecret } = env.oauth.facebook;
    if (!clientId || !clientSecret) {
      throw ApiError.solicitudInvalida('Faltan credenciales de Facebook OAuth en .env.');
    }
    if (clientId.endsWith('.apps.googleusercontent.com')) {
      return intercambiarCodigoPorToken('google', code);
    }
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    });
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`
    );
    const datos = await resp.json();
    if (!resp.ok || !datos.access_token) {
      throw ApiError.noAutorizado(
        datos?.error?.message || 'Error al canjear código con Facebook.'
      );
    }
    return datos.access_token;
  }

  throw ApiError.solicitudInvalida('Proveedor OAuth no soportado.');
}

/** Columnas públicas del usuario junto a su rol (nunca incluye datos sensibles adicionales). */
const SELECT_USUARIO = `
  SELECT u.\`id\`, u.\`email\`, u.\`password_hash\`, u.\`nombre\`, u.\`apellido\`, u.\`telefono\`,
         u.\`activo\`, u.\`email_verificado\`, u.\`ultimo_login_en\`, u.\`creado_en\`,
         r.\`codigo\` AS rol_codigo, r.\`nombre\` AS rol_nombre
    FROM \`usuarios\` u
    JOIN \`roles\` r ON r.\`id\` = u.\`rol_id\``;

/**
 * Realiza un GET que devuelve JSON; lanza si la respuesta no es 2xx.
 * @param {string} url
 * @param {Object} [opciones] Opciones de fetch (headers, etc.).
 * @returns {Promise<Object|Array>}
 */
async function pedirJson(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  if (!respuesta.ok) throw new Error(`Respuesta HTTP ${respuesta.status}`);
  return respuesta.json();
}

/**
 * Verifica el token real de un proveedor OAuth y normaliza el perfil del usuario.
 * @param {'google'|'facebook'|'github'} proveedor
 * @param {string} token Token/access token o id_token emitido por el proveedor.
 * @returns {Promise<{proveedorUserId:string, email:(string|null), nombre:(string|null), avatarUrl:(string|null)}>}
 */
export async function verificarToken(proveedor, token) {
  try {
    if (proveedor === 'google') {
      // Soportar tanto access_token (userinfo) como id_token (tokeninfo)
      let datos = null;
      const respUser = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (respUser.ok) {
        datos = await respUser.json();
      } else {
        datos = await pedirJson(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
        );
      }
      if (!datos?.sub) throw new Error('El proveedor no devolvió el identificador.');
      return {
        proveedorUserId: String(datos.sub),
        email: datos.email ?? null,
        nombre: datos.name ?? null,
        avatarUrl: datos.picture ?? null
      };
    }

    if (proveedor === 'facebook') {
      if ((env.oauth.facebook.clientId || '').endsWith('.apps.googleusercontent.com')) {
        return verificarToken('google', token);
      }
      const datos = await pedirJson(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(token)}`
      );
      if (!datos?.id) throw new Error('El proveedor no devolvió el identificador.');
      return {
        proveedorUserId: String(datos.id),
        email: datos.email ?? null,
        nombre: datos.name ?? null,
        avatarUrl: datos?.picture?.data?.url ?? null
      };
    }

    if (proveedor === 'github') {
      const cabeceras = {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'retenes-stock',
        Accept: 'application/vnd.github+json'
      };
      const datos = await pedirJson('https://api.github.com/user', { headers: cabeceras });
      if (!datos?.id) throw new Error('El proveedor no devolvió el identificador.');

      let email = datos.email ?? null;
      if (!email) {
        const correos = await pedirJson('https://api.github.com/user/emails', { headers: cabeceras });
        if (Array.isArray(correos)) {
          const elegido =
            correos.find((correo) => correo.primary && correo.verified) ??
            correos.find((correo) => correo.verified) ??
            correos[0];
          email = elegido?.email ?? null;
        }
      }

      return {
        proveedorUserId: String(datos.id),
        email,
        nombre: datos.name ?? datos.login ?? null,
        avatarUrl: datos.avatar_url ?? null
      };
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.noAutorizado('No se pudo verificar la cuenta del proveedor.');
  }

  throw ApiError.noAutorizado('No se pudo verificar la cuenta del proveedor.');
}

/**
 * Vincula un perfil OAuth a un usuario existente o crea uno nuevo (rol 'vendedor').
 * Idempotente: repetir la vinculación actualiza los datos del proveedor.
 * @param {{proveedor:string, proveedorUserId:string, email:(string|null), nombre:(string|null), avatarUrl:(string|null)}} perfil
 * @returns {Promise<Object>} Usuario completo con rol.
 */
export async function vincularOcrearUsuario(perfil) {
  const {
    proveedor,
    proveedorUserId,
    email = null,
    nombre = null,
    avatarUrl = null
  } = perfil;

  // 1) ¿Ya existe la vinculación del proveedor?
  let usuario = await queryUna(
    `${SELECT_USUARIO}
      JOIN \`proveedores_oauth\` po ON po.\`usuario_id\` = u.\`id\`
     WHERE po.\`proveedor\` = ? AND po.\`proveedor_user_id\` = ?`,
    [proveedor, proveedorUserId]
  );

  // 2) ¿Existe un usuario con el mismo email?
  if (!usuario && email) {
    usuario = await queryUna(`${SELECT_USUARIO} WHERE u.\`email\` = ?`, [email]);
  }

  // 3) Crear usuario nuevo (rol 'admin' por defecto o 'vendedor' como respaldo).
  if (!usuario) {
    let rol = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', ['admin']);
    if (!rol) {
      rol = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', ['vendedor']);
    }
    if (!rol) throw ApiError.interno('No están configurados los roles del sistema.');

    const emailCuenta = email ?? `${proveedor}_${proveedorUserId}@oauth.local`;
    const insercion = await ejecutar(
      `INSERT INTO \`usuarios\` (\`rol_id\`, \`email\`, \`password_hash\`, \`nombre\`, \`activo\`, \`email_verificado\`)
       VALUES (?, ?, NULL, ?, 1, 1)`,
      [rol.id, emailCuenta, nombre ?? proveedor]
    );
    usuario = await queryUna(`${SELECT_USUARIO} WHERE u.\`id\` = ?`, [insercion.insertId]);
  }

  // 4) Registrar/actualizar la fila del proveedor (idempotente).
  await ejecutar(
    `INSERT INTO \`proveedores_oauth\` (\`usuario_id\`, \`proveedor\`, \`proveedor_user_id\`, \`email_proveedor\`, \`avatar_url\`)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       \`usuario_id\` = VALUES(\`usuario_id\`),
       \`email_proveedor\` = VALUES(\`email_proveedor\`),
       \`avatar_url\` = VALUES(\`avatar_url\`)`,
    [usuario.id, proveedor, proveedorUserId, email, avatarUrl]
  );

  // 5) Devolver el usuario completo con rol.
  return usuario;
}
