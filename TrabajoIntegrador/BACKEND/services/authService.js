/**
 * authService.js
 * Lógica de autenticación: registro, login, refresh con rotación, logout,
 * social login y cambio de contraseña.
 */
import ApiError from '../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt.js';
import * as usuarioRepo from '../repositories/usuarioRepo.js';
import * as tokenRepo from '../repositories/tokenRepo.js';
import * as oauthRepo from '../repositories/oauthRepo.js';
import * as rolRepo from '../repositories/rolRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';
import { verificarTokenSocial } from './oauthService.js';

const ROL_POR_DEFECTO = 'Vendedor';

/** Convierte "7d"/"15m"/"12h"/"3600" a milisegundos. */
function expiresToMs(exp) {
  const m = String(exp).match(/^(\d+)\s*([smhd])?$/i);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(m[1], 10);
  const unit = (m[2] || 's').toLowerCase();
  const factor = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return value * factor;
}

/** Datos públicos del usuario (sin password_hash). */
function publicUser(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    rol: u.rol,
    rolId: u.rol_id,
    activo: !!u.activo,
    emailVerificado: !!u.email_verificado,
    ultimoLogin: u.ultimo_login,
  };
}

/** Emite access + refresh y persiste el refresh (hasheado) para rotación/revocación. */
async function issueTokens(usuario, ip, userAgent) {
  const accessToken = signAccessToken({
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    rolId: usuario.rol_id,
  });
  const refreshToken = signRefreshToken({ id: usuario.id });
  const expiraEn = new Date(Date.now() + expiresToMs(process.env.JWT_REFRESH_EXPIRES || '7d'));

  await tokenRepo.save({
    usuarioId: usuario.id,
    tokenHash: hashToken(refreshToken),
    expiraEn,
    ip,
    userAgent,
  });

  return { accessToken, refreshToken };
}

export async function register({ nombre, apellido, email, password, ip, userAgent }) {
  const existente = await usuarioRepo.findByEmail(email);
  if (existente) throw ApiError.conflict('Ya existe un usuario con ese email');

  const rol = await rolRepo.findByNombre(ROL_POR_DEFECTO);
  if (!rol) throw ApiError.internal('No existe el rol por defecto. Ejecutá el SQL de seed.');

  const passwordHash = await hashPassword(password);
  const id = await usuarioRepo.create({ nombre, apellido, email, passwordHash, rolId: rol.id });
  const usuario = await usuarioRepo.findById(id);

  await auditoriaRepo.create({ usuarioId: id, accion: 'REGISTRO', entidad: 'usuario', entidadId: id, ip });
  const tokens = await issueTokens(usuario, ip, userAgent);
  return { usuario: publicUser(usuario), ...tokens };
}

export async function login({ email, password, ip, userAgent }) {
  const usuario = await usuarioRepo.findByEmail(email);
  if (!usuario) throw ApiError.unauthorized('Credenciales inválidas');
  if (!usuario.activo) throw ApiError.forbidden('La cuenta está deshabilitada');
  if (!usuario.password_hash) {
    throw ApiError.unauthorized('Esta cuenta usa inicio de sesión social. Ingresá con Google/Facebook/GitHub.');
  }

  const ok = await verifyPassword(password, usuario.password_hash);
  if (!ok) throw ApiError.unauthorized('Credenciales inválidas');

  await usuarioRepo.update(usuario.id, { ultimoLogin: new Date() });
  await auditoriaRepo.create({ usuarioId: usuario.id, accion: 'LOGIN', entidad: 'usuario', entidadId: usuario.id, ip });

  const tokens = await issueTokens(usuario, ip, userAgent);
  return { usuario: publicUser(usuario), ...tokens };
}

export async function loginSocial({ proveedor, accessToken, ip, userAgent }) {
  const perfil = await verificarTokenSocial(proveedor, accessToken);

  let usuario = null;
  const vinculo = await oauthRepo.findByProvider(perfil.proveedor, perfil.providerUserId);

  if (vinculo) {
    usuario = await usuarioRepo.findById(vinculo.usuario_id);
  } else if (perfil.email) {
    usuario = await usuarioRepo.findByEmail(perfil.email);
    if (usuario) {
      await oauthRepo.link({
        usuarioId: usuario.id,
        proveedor: perfil.proveedor,
        providerUserId: perfil.providerUserId,
        emailProveedor: perfil.email,
      });
    }
  }

  if (!usuario) {
    const rol = await rolRepo.findByNombre(ROL_POR_DEFECTO);
    const email = perfil.email || `${perfil.proveedor}_${perfil.providerUserId}@social.local`;
    const id = await usuarioRepo.create({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      email,
      passwordHash: null,
      rolId: rol.id,
      emailVerificado: 1,
    });
    await oauthRepo.link({
      usuarioId: id,
      proveedor: perfil.proveedor,
      providerUserId: perfil.providerUserId,
      emailProveedor: perfil.email,
    });
    usuario = await usuarioRepo.findById(id);
  }

  if (!usuario.activo) throw ApiError.forbidden('La cuenta está deshabilitada');

  await usuarioRepo.update(usuario.id, { ultimoLogin: new Date() });
  await auditoriaRepo.create({
    usuarioId: usuario.id,
    accion: `LOGIN_${perfil.proveedor.toUpperCase()}`,
    entidad: 'usuario',
    entidadId: usuario.id,
    ip,
  });

  const tokens = await issueTokens(usuario, ip, userAgent);
  return { usuario: publicUser(usuario), ...tokens };
}

/** Rota el refresh token: revoca el anterior y emite par nuevo. */
export async function refresh({ refreshToken, ip, userAgent }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token inválido o expirado');
  }

  const stored = await tokenRepo.findByHash(hashToken(refreshToken));
  if (!stored || stored.revocado || new Date(stored.expira_en) < new Date()) {
    // Uso de un token revocado => posible reuso. Se revocan todos por seguridad.
    await tokenRepo.revokeAllForUser(payload.id);
    throw ApiError.unauthorized('Refresh token revocado');
  }

  const usuario = await usuarioRepo.findById(payload.id);
  if (!usuario || !usuario.activo) throw ApiError.unauthorized('Usuario inactivo');

  const tokens = await issueTokens(usuario, ip, userAgent);
  // Encadena la rotación
  const nuevo = await tokenRepo.findByHash(hashToken(tokens.refreshToken));
  await tokenRepo.revoke(stored.id, nuevo?.id ?? null);

  return { usuario: publicUser(usuario), ...tokens };
}

export async function logout({ refreshToken }) {
  if (!refreshToken) return;
  const stored = await tokenRepo.findByHash(hashToken(refreshToken));
  if (stored && !stored.revocado) await tokenRepo.revoke(stored.id);
}

export async function me(userId) {
  const usuario = await usuarioRepo.findById(userId);
  if (!usuario) throw ApiError.notFound('Usuario no encontrado');
  return publicUser(usuario);
}

export async function changePassword(userId, { actual, nueva }) {
  const usuario = await usuarioRepo.findById(userId);
  if (!usuario) throw ApiError.notFound('Usuario no encontrado');

  if (usuario.password_hash) {
    const ok = await verifyPassword(actual, usuario.password_hash);
    if (!ok) throw ApiError.unauthorized('La contraseña actual no es correcta');
  }
  const passwordHash = await hashPassword(nueva);
  await usuarioRepo.update(userId, { passwordHash });
  await tokenRepo.revokeAllForUser(userId); // fuerza re-login
  return { ok: true };
}

export default {
  register, login, loginSocial, refresh, logout, me, changePassword,
};
