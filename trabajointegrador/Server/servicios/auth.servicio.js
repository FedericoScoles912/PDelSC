/**
 * @file Lógica de autenticación: login local, login social, emisión/rotación de
 *       tokens, cierre de sesión y gestión del perfil propio del usuario.
 * @module Server/servicios/auth
 */

import crypto from 'node:crypto';

import bcrypt from 'bcryptjs';

import { conTransaccion, ejecutar, queryUna } from '../config/db.js';
import { ApiError } from '../utils/http.js';
import {
  expiracionRefresh,
  firmarAccess,
  firmarRefresh,
  hashToken,
  verificarRefresh
} from '../utils/jwt.js';
import { verificarToken, vincularOcrearUsuario } from './oauth.servicio.js';

/** Columnas del usuario junto a su rol. */
const SELECT_USUARIO = `
  SELECT u.\`id\`, u.\`email\`, u.\`password_hash\`, u.\`nombre\`, u.\`apellido\`, u.\`telefono\`,
         u.\`activo\`, u.\`email_verificado\`, u.\`ultimo_login_en\`, u.\`creado_en\`,
         r.\`codigo\` AS rol_codigo, r.\`nombre\` AS rol_nombre
    FROM \`usuarios\` u
    JOIN \`roles\` r ON r.\`id\` = u.\`rol_id\``;

/**
 * Convierte una fila de usuario (con rol) en su representación pública.
 * @param {Object} fila
 * @returns {Object} Usuario sin `password_hash`.
 */
export function mapearUsuario(fila) {
  return {
    id: fila.id,
    email: fila.email,
    nombre: fila.nombre,
    apellido: fila.apellido,
    telefono: fila.telefono,
    activo: Boolean(fila.activo),
    emailVerificado: Boolean(fila.email_verificado),
    ultimoLoginEn: fila.ultimo_login_en ?? null,
    creadoEn: fila.creado_en,
    rol: { codigo: fila.rol_codigo, nombre: fila.rol_nombre }
  };
}

/**
 * Busca un usuario (con rol) por email.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function buscarPorEmail(email) {
  return queryUna(`${SELECT_USUARIO} WHERE u.\`email\` = ?`, [email]);
}

/**
 * Busca un usuario (con rol) por id.
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
async function buscarPorId(id) {
  return queryUna(`${SELECT_USUARIO} WHERE u.\`id\` = ?`, [id]);
}

/**
 * Emite un par de tokens y persiste el refresh (sólo su hash).
 * @param {Object} usuario Usuario público (con `rol.codigo`).
 * @param {{userAgent?:(string|null), ip?:(string|null)}} [contexto]
 * @returns {Promise<{accessToken:string, refreshToken:string}>}
 */
export async function emitirSesion(usuario, { userAgent = null, ip = null } = {}) {
  const accessToken = firmarAccess({
    sub: usuario.id,
    rol: usuario.rol.codigo,
    email: usuario.email,
    nombre: usuario.nombre
  });
  const refreshToken = firmarRefresh({ sub: usuario.id, jti: crypto.randomUUID() });

  await ejecutar(
    `INSERT INTO \`refresh_tokens\` (\`usuario_id\`, \`token_hash\`, \`expira_en\`, \`user_agent\`, \`ip\`)
     VALUES (?, ?, ?, ?, ?)`,
    [usuario.id, hashToken(refreshToken), expiracionRefresh(), userAgent, ip]
  );

  return { accessToken, refreshToken };
}

/**
 * Inicia sesión con email y contraseña.
 * @param {{email:string, password:string, userAgent?:(string|null), ip?:(string|null)}} datos
 * @returns {Promise<{usuario:Object, accessToken:string, refreshToken:string}>}
 */
export async function iniciarSesion({ email, password, userAgent = null, ip = null }) {
  const fila = await buscarPorEmail(email);
  if (!fila || !fila.activo) throw ApiError.noAutorizado('Credenciales inválidas.');
  if (!fila.password_hash) throw ApiError.noAutorizado('Esa cuenta usa inicio de sesión social.');

  const coincide = await bcrypt.compare(password, fila.password_hash);
  if (!coincide) throw ApiError.noAutorizado('Credenciales inválidas.');

  await ejecutar('UPDATE `usuarios` SET `ultimo_login_en` = NOW() WHERE `id` = ?', [fila.id]);
  fila.ultimo_login_en = new Date();

  const usuario = mapearUsuario(fila);
  const tokens = await emitirSesion(usuario, { userAgent, ip });
  return { usuario, ...tokens };
}

/**
 * Inicia sesión mediante un proveedor OAuth, creando/vinculando el usuario si hace falta.
 * @param {{proveedor:string, token:string, userAgent?:(string|null), ip?:(string|null)}} datos
 * @returns {Promise<{usuario:Object, accessToken:string, refreshToken:string}>}
 */
export async function iniciarSesionOAuth({ proveedor, token, userAgent = null, ip = null }) {
  const perfilRed = await verificarToken(proveedor, token);
  const fila = await vincularOcrearUsuario({ proveedor, ...perfilRed });
  if (!fila || !fila.activo) throw ApiError.noAutorizado('La cuenta está desactivada.');

  await ejecutar('UPDATE `usuarios` SET `ultimo_login_en` = NOW() WHERE `id` = ?', [fila.id]);
  fila.ultimo_login_en = new Date();

  const usuario = mapearUsuario(fila);
  const tokens = await emitirSesion(usuario, { userAgent, ip });
  return { usuario, ...tokens };
}

/**
 * Rota un refresh token: invalida el actual y emite un par nuevo.
 * Detecta reuso de tokens revocados y cierra todas las sesiones del usuario.
 * @param {{refreshToken:string, userAgent?:(string|null), ip?:(string|null)}} datos
 * @returns {Promise<{accessToken:string, refreshToken:string}>}
 */
export async function refrescar({ refreshToken, userAgent = null, ip = null }) {
  try {
    verificarRefresh(refreshToken);
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new ApiError(401, 'TOKEN_EXPIRADO', 'La sesión expiró.');
    }
    throw new ApiError(401, 'TOKEN_INVALIDO', 'Token inválido.');
  }

  const fila = await queryUna(
    'SELECT `id`, `usuario_id`, `revocado`, `expira_en` FROM `refresh_tokens` WHERE `token_hash` = ?',
    [hashToken(refreshToken)]
  );
  if (!fila) throw new ApiError(401, 'TOKEN_INVALIDO', 'Token inválido.');

  if (fila.revocado) {
    await ejecutar('UPDATE `refresh_tokens` SET `revocado` = 1 WHERE `usuario_id` = ? AND `revocado` = 0', [
      fila.usuario_id
    ]);
    throw ApiError.noAutorizado('Sesión revocada por seguridad.');
  }

  if (new Date(fila.expira_en).getTime() < Date.now()) {
    throw new ApiError(401, 'TOKEN_EXPIRADO', 'La sesión expiró.');
  }

  const usuarioFila = await buscarPorId(fila.usuario_id);
  if (!usuarioFila || !usuarioFila.activo) throw ApiError.noAutorizado('La cuenta está desactivada.');

  const usuario = mapearUsuario(usuarioFila);
  const accessToken = firmarAccess({
    sub: usuario.id,
    rol: usuario.rol.codigo,
    email: usuario.email,
    nombre: usuario.nombre
  });
  const nuevoRefresh = firmarRefresh({ sub: usuario.id, jti: crypto.randomUUID() });
  const nuevoHash = hashToken(nuevoRefresh);

  await conTransaccion(async (conexion) => {
    await conexion.execute(
      'UPDATE `refresh_tokens` SET `revocado` = 1, `reemplazado_por` = ? WHERE `id` = ?',
      [nuevoHash, fila.id]
    );
    await conexion.execute(
      `INSERT INTO \`refresh_tokens\` (\`usuario_id\`, \`token_hash\`, \`expira_en\`, \`user_agent\`, \`ip\`)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario.id, nuevoHash, expiracionRefresh(), userAgent, ip]
    );
  });

  return { accessToken, refreshToken: nuevoRefresh };
}

/**
 * Cierra la sesión revocando el refresh token indicado. Idempotente.
 * @param {{refreshToken?:(string|null)}} [datos]
 * @returns {Promise<void>}
 */
export async function cerrarSesion({ refreshToken } = {}) {
  if (!refreshToken) return;
  await ejecutar('UPDATE `refresh_tokens` SET `revocado` = 1 WHERE `token_hash` = ? AND `revocado` = 0', [
    hashToken(refreshToken)
  ]);
}

/**
 * Devuelve el perfil público del usuario autenticado.
 * @param {number|string} usuarioId
 * @returns {Promise<Object>}
 */
export async function perfil(usuarioId) {
  const fila = await buscarPorId(usuarioId);
  if (!fila) throw ApiError.noEncontrado('Usuario no encontrado.');
  return mapearUsuario(fila);
}

/**
 * Actualiza nombre/apellido/teléfono del usuario autenticado.
 * @param {number|string} usuarioId
 * @param {{nombre?:string, apellido?:string, telefono?:string}} datos
 * @returns {Promise<Object>} Perfil actualizado.
 */
export async function actualizarPerfil(usuarioId, { nombre, apellido, telefono } = {}) {
  const asignaciones = [];
  const parametros = [];

  if (nombre !== undefined) {
    asignaciones.push('`nombre` = ?');
    parametros.push(nombre);
  }
  if (apellido !== undefined) {
    asignaciones.push('`apellido` = ?');
    parametros.push(apellido);
  }
  if (telefono !== undefined) {
    asignaciones.push('`telefono` = ?');
    parametros.push(telefono);
  }

  if (asignaciones.length) {
    parametros.push(usuarioId);
    await ejecutar(`UPDATE \`usuarios\` SET ${asignaciones.join(', ')} WHERE \`id\` = ?`, parametros);
  }

  return perfil(usuarioId);
}

/**
 * Cambia la contraseña del usuario y revoca todas sus sesiones activas.
 * Si la cuenta no tiene contraseña local, no exige la contraseña actual.
 * @param {number|string} usuarioId
 * @param {{actual?:string, nueva:string}} datos
 * @returns {Promise<void>}
 */
export async function cambiarPassword(usuarioId, { actual, nueva } = {}) {
  const fila = await queryUna('SELECT `id`, `password_hash` FROM `usuarios` WHERE `id` = ?', [usuarioId]);
  if (!fila) throw ApiError.noEncontrado('Usuario no encontrado.');

  if (fila.password_hash) {
    if (!actual) throw ApiError.solicitudInvalida('Tenés que ingresar tu contraseña actual.');
    const coincide = await bcrypt.compare(actual, fila.password_hash);
    if (!coincide) throw ApiError.solicitudInvalida('La contraseña actual no es correcta.');
  }

  const hash = await bcrypt.hash(nueva, 10);
  await ejecutar('UPDATE `usuarios` SET `password_hash` = ? WHERE `id` = ?', [hash, usuarioId]);
  await ejecutar('UPDATE `refresh_tokens` SET `revocado` = 1 WHERE `usuario_id` = ? AND `revocado` = 0', [
    usuarioId
  ]);
}
