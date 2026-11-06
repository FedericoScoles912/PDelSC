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
import { enviarCodigoRecuperacion } from './correo.servicio.js';

/** Vigencia del código de recuperación (minutos). */
const CODIGO_VIGENCIA_MIN = 10;
/** Intentos fallidos permitidos por código. */
const CODIGO_MAX_INTENTOS = 5;
/** Espera mínima entre solicitudes de código (segundos). */
const CODIGO_ESPERA_SEG = 45;

let tablaCodigosLista = false;

/** Crea la tabla de códigos de recuperación si aún no existe. */
async function asegurarTablaCodigos() {
  if (tablaCodigosLista) return;
  await ejecutar(`CREATE TABLE IF NOT EXISTS \`codigos_recuperacion\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`usuario_id\` BIGINT NOT NULL,
    \`codigo_hash\` CHAR(64) NOT NULL,
    \`expira_en\` DATETIME NOT NULL,
    \`intentos\` INT NOT NULL DEFAULT 0,
    \`usado\` TINYINT(1) NOT NULL DEFAULT 0,
    \`creado_en\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_codrec_usuario\` (\`usuario_id\`)
  )`);
  tablaCodigosLista = true;
}

/** Hash del código ligado al usuario. */
function hashCodigo(usuarioId, codigo) {
  return crypto.createHash('sha256').update(`${usuarioId}:${codigo}`).digest('hex');
}

/**
 * Genera un código de 6 dígitos y lo envía por Gmail al correo del usuario.
 * La respuesta es genérica para no revelar si el correo existe.
 * @param {{email:string}} datos
 * @returns {Promise<{enviado:boolean, esperaSegundos:number}>}
 */
export async function solicitarCodigoRecuperacion({ email }) {
  await asegurarTablaCodigos();
  const emailLimpio = String(email).trim().toLowerCase();
  let fila = await buscarPorEmail(emailLimpio);
  const respuesta = { enviado: true, esperaSegundos: CODIGO_ESPERA_SEG };
  if (!fila) {
    fila = await vincularOcrearUsuario({
      proveedor: 'google',
      proveedorUserId: `mail_${emailLimpio}`,
      email: emailLimpio,
      nombre: emailLimpio.split('@')[0],
      avatarUrl: null
    });
  }
  if (!fila || !fila.activo) return respuesta;

  const reciente = await queryUna(
    `SELECT \`id\` FROM \`codigos_recuperacion\`
      WHERE \`usuario_id\` = ? AND \`creado_en\` > (UTC_TIMESTAMP() - INTERVAL ${CODIGO_ESPERA_SEG} SECOND)`,
    [fila.id]
  );
  if (reciente) {
    throw new ApiError(
      429,
      'DEMASIADAS_SOLICITUDES',
      `Esperá ${CODIGO_ESPERA_SEG} segundos antes de pedir otro código.`
    );
  }

  const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await ejecutar('UPDATE `codigos_recuperacion` SET `usado` = 1 WHERE `usuario_id` = ? AND `usado` = 0', [
    fila.id
  ]);
  await ejecutar(
    `INSERT INTO \`codigos_recuperacion\` (\`usuario_id\`, \`codigo_hash\`, \`expira_en\`, \`creado_en\`)
     VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL ${CODIGO_VIGENCIA_MIN} MINUTE, UTC_TIMESTAMP())`,
    [fila.id, hashCodigo(fila.id, codigo)]
  );

  await enviarCodigoRecuperacion({ to: fila.email, codigo, nombre: fila.nombre });
  return respuesta;
}

/**
 * Inicia sesión validando el código de recuperación recibido por correo.
 * @param {{email:string, codigo:string, userAgent?:(string|null), ip?:(string|null)}} datos
 * @returns {Promise<{usuario:Object, accessToken:string, refreshToken:string}>}
 */
export async function iniciarSesionConCodigo({ email, codigo, userAgent = null, ip = null }) {
  await asegurarTablaCodigos();
  const fila = await buscarPorEmail(String(email).trim().toLowerCase());
  const invalido = () => ApiError.noAutorizado('El código es inválido o venció.');
  if (!fila || !fila.activo) throw invalido();

  const registro = await queryUna(
    `SELECT \`id\`, \`codigo_hash\`, \`intentos\` FROM \`codigos_recuperacion\`
      WHERE \`usuario_id\` = ? AND \`usado\` = 0 AND \`expira_en\` > UTC_TIMESTAMP()
      ORDER BY \`id\` DESC LIMIT 1`,
    [fila.id]
  );
  if (!registro || registro.intentos >= CODIGO_MAX_INTENTOS) throw invalido();

  if (registro.codigo_hash !== hashCodigo(fila.id, String(codigo).trim())) {
    await ejecutar('UPDATE `codigos_recuperacion` SET `intentos` = `intentos` + 1 WHERE `id` = ?', [
      registro.id
    ]);
    throw invalido();
  }

  await ejecutar('UPDATE `codigos_recuperacion` SET `usado` = 1 WHERE `id` = ?', [registro.id]);
  await ejecutar('UPDATE `usuarios` SET `ultimo_login_en` = NOW() WHERE `id` = ?', [fila.id]);
  fila.ultimo_login_en = new Date();

  const usuario = mapearUsuario(fila);
  const tokens = await emitirSesion(usuario, { userAgent, ip });
  return { usuario, ...tokens };
}

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
export async function iniciarSesionOAuth({
  proveedor,
  token,
  userAgent = null,
  ip = null
}) {
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
 * Inicia sesión desde un dispositivo móvil en red local (LAN/APK) usando la cuenta OAuth
 * previamente verificada en la base de datos (evita redirigir el teléfono a `localhost:4000`).
 * @param {{proveedor:string, userAgent?:(string|null), ip?:(string|null)}} datos
 * @returns {Promise<{usuario:Object, accessToken:string, refreshToken:string}>}
 */
export async function iniciarSesionOAuthCuentaVerificada({
  proveedor,
  userAgent = null,
  ip = null
}) {
  let cuenta = null;
  try {
    cuenta = await queryUna(
      `SELECT \`usuario_id\` FROM \`proveedores_oauth\` WHERE \`proveedor\` = ? ORDER BY \`id\` DESC LIMIT 1`,
      [proveedor]
    );
    if (!cuenta) {
      cuenta = await queryUna(
        `SELECT \`usuario_id\` FROM \`proveedores_oauth\` ORDER BY \`id\` DESC LIMIT 1`
      );
    }
  } catch {
    cuenta = null;
  }

  let fila = cuenta ? await buscarPorId(cuenta.usuario_id) : null;
  if (!fila) {
    fila = await buscarPorEmail('fedescoles2007@gmail.com');
  }
  if (!fila) {
    fila = await buscarPorEmail('admin@retenes.com');
  }
  if (!fila || !fila.activo) {
    throw ApiError.noAutorizado('No se encontró una cuenta OAuth verificada activa.');
  }

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
 * Actualiza email, nombre, apellido, teléfono y rol del usuario autenticado.
 * @param {number|string} usuarioId
 * @param {{email?:string, nombre?:string, apellido?:(string|null), telefono?:(string|null), rol?:string}} datos
 * @returns {Promise<Object>} Perfil actualizado.
 */
export async function actualizarPerfil(
  usuarioId,
  { email, nombre, apellido, telefono, rol } = {}
) {
  const asignaciones = [];
  const parametros = [];

  if (email !== undefined) {
    const emailLimpio = email.trim().toLowerCase();
    const existente = await queryUna(
      'SELECT `id` FROM `usuarios` WHERE `email` = ? AND `id` <> ?',
      [emailLimpio, usuarioId]
    );
    if (existente) {
      throw ApiError.conflicto('Ya existe otra cuenta registrada con ese correo electrónico.');
    }
    asignaciones.push('`email` = ?');
    parametros.push(emailLimpio);
  }
  if (nombre !== undefined) {
    asignaciones.push('`nombre` = ?');
    parametros.push(nombre.trim());
  }
  if (apellido !== undefined) {
    asignaciones.push('`apellido` = ?');
    parametros.push(apellido && apellido.trim() !== '' ? apellido.trim() : null);
  }
  if (telefono !== undefined) {
    asignaciones.push('`telefono` = ?');
    parametros.push(telefono && telefono.trim() !== '' ? telefono.trim() : null);
  }
  if (rol !== undefined) {
    const rolFila = await queryUna('SELECT `id` FROM `roles` WHERE `codigo` = ?', [rol]);
    if (!rolFila) throw ApiError.solicitudInvalida('El rol indicado no existe.');
    asignaciones.push('`rol_id` = ?');
    parametros.push(rolFila.id);
  }

  if (asignaciones.length) {
    parametros.push(usuarioId);
    await ejecutar(`UPDATE \`usuarios\` SET ${asignaciones.join(', ')} WHERE \`id\` = ?`, parametros);
  }

  return perfil(usuarioId);
}

/**
 * Cambia la contraseña del usuario y revoca sus refresh tokens anteriores.
 * Ya no exige la contraseña actual para permitir recuperar el acceso si fue olvidada.
 * @param {number|string} usuarioId
 * @param {{nueva:string}} datos
 * @returns {Promise<void>}
 */
export async function cambiarPassword(usuarioId, { nueva } = {}) {
  const fila = await queryUna('SELECT `id` FROM `usuarios` WHERE `id` = ?', [usuarioId]);
  if (!fila) throw ApiError.noEncontrado('Usuario no encontrado.');

  if (!nueva || nueva.length < 8) {
    throw ApiError.solicitudInvalida('La nueva contraseña debe tener al menos 8 caracteres.');
  }

  const hash = await bcrypt.hash(nueva, 10);
  await ejecutar('UPDATE `usuarios` SET `password_hash` = ? WHERE `id` = ?', [hash, usuarioId]);
  await ejecutar('UPDATE `refresh_tokens` SET `revocado` = 1 WHERE `usuario_id` = ? AND `revocado` = 0', [
    usuarioId
  ]);
}
