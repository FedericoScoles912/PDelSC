/**
 * @file Verificación de tokens de proveedores OAuth (Google/Facebook/GitHub)
 *       y vinculación o creación del usuario local correspondiente.
 * @module Server/servicios/oauth
 */

import { ejecutar, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';

/** Proveedores sociales soportados. */
export const PROVEEDORES = ['google', 'facebook', 'github'];

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
 * Verifica el token de un proveedor y normaliza el perfil del usuario.
 * @param {'google'|'facebook'|'github'} proveedor
 * @param {string} token Token/access token emitido por el proveedor.
 * @returns {Promise<{proveedorUserId:string, email:(string|null), nombre:(string|null), avatarUrl:(string|null)}>}
 */
export async function verificarToken(proveedor, token) {
  try {
    if (proveedor === 'google') {
      const datos = await pedirJson(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
      );
      if (!datos?.sub) throw new Error('El proveedor no devolvió el identificador.');
      return {
        proveedorUserId: String(datos.sub),
        email: datos.email ?? null,
        nombre: datos.name ?? null,
        avatarUrl: datos.picture ?? null
      };
    }

    if (proveedor === 'facebook') {
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

  // 3) Crear usuario nuevo con rol 'vendedor'.
  if (!usuario) {
    const rol = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', ['vendedor']);
    if (!rol) throw ApiError.interno('No está configurado el rol "vendedor".');

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
