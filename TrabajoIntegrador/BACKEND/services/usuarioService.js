/**
 * usuarioService.js
 * Gestión de usuarios (sólo Administrador): listado, alta, edición, roles, estado.
 */
import ApiError from '../utils/ApiError.js';
import { hashPassword } from '../utils/password.js';
import * as usuarioRepo from '../repositories/usuarioRepo.js';
import * as rolRepo from '../repositories/rolRepo.js';
import * as tokenRepo from '../repositories/tokenRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

const publicUser = (u) => ({
  id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email,
  rol: u.rol, rolId: u.rol_id, activo: !!u.activo,
  emailVerificado: !!u.email_verificado, ultimoLogin: u.ultimo_login, creadoEn: u.creado_en,
});

export const listar = async (filtros, paginacion) => {
  const { rows, total } = await usuarioRepo.list({ ...filtros, ...paginacion });
  return { rows: rows.map(publicUser), total };
};

export const obtener = async (id) => {
  const u = await usuarioRepo.findById(id);
  if (!u) throw ApiError.notFound('Usuario no encontrado');
  return publicUser(u);
};

export const crear = async (data, actor) => {
  if (await usuarioRepo.findByEmail(data.email)) throw ApiError.conflict('Ya existe un usuario con ese email');
  const rol = await rolRepo.findById(data.rolId);
  if (!rol) throw ApiError.unprocessable('Rol inexistente');
  const passwordHash = await hashPassword(data.password);
  const id = await usuarioRepo.create({
    nombre: data.nombre, apellido: data.apellido, email: data.email,
    passwordHash, rolId: data.rolId, emailVerificado: 1,
  });
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'CREAR', entidad: 'usuario', entidadId: id,
    datosDespues: { ...data, password: undefined }, ip: actor?.ip,
  });
  return obtener(id);
};

export const actualizar = async (id, data, actor) => {
  const actual = await usuarioRepo.findById(id);
  if (!actual) throw ApiError.notFound('Usuario no encontrado');
  if (data.email && data.email !== actual.email && (await usuarioRepo.findByEmail(data.email))) {
    throw ApiError.conflict('El email ya está en uso');
  }
  const payload = { ...data };
  delete payload.password;
  if (data.password) payload.passwordHash = await hashPassword(data.password);
  await usuarioRepo.update(id, payload);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ACTUALIZAR', entidad: 'usuario', entidadId: id,
    datosAntes: publicUser(actual), datosDespues: { ...data, password: undefined }, ip: actor?.ip,
  });
  return obtener(id);
};

export const cambiarEstado = async (id, activo, actor) => {
  await obtener(id);
  await usuarioRepo.update(id, { activo: activo ? 1 : 0 });
  if (!activo) await tokenRepo.revokeAllForUser(id);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: activo ? 'ACTIVAR' : 'DESACTIVAR', entidad: 'usuario', entidadId: id, ip: actor?.ip,
  });
  return obtener(id);
};

export const cambiarRol = async (id, rolId, actor) => {
  await obtener(id);
  const rol = await rolRepo.findById(rolId);
  if (!rol) throw ApiError.unprocessable('Rol inexistente');
  await usuarioRepo.update(id, { rolId });
  await tokenRepo.revokeAllForUser(id); // los permisos cambian -> re-login
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'CAMBIO_ROL', entidad: 'usuario', entidadId: id,
    datosDespues: { rolId, rol: rol.nombre }, ip: actor?.ip,
  });
  return obtener(id);
};

export const eliminar = async (id, actor) => {
  const u = await usuarioRepo.findById(id);
  if (!u) throw ApiError.notFound('Usuario no encontrado');
  if (actor?.id === id) throw ApiError.badRequest('No podés eliminar tu propio usuario');
  await usuarioRepo.remove(id);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ELIMINAR', entidad: 'usuario', entidadId: id, datosAntes: publicUser(u), ip: actor?.ip,
  });
  return { ok: true };
};

export default { listar, obtener, crear, actualizar, cambiarEstado, cambiarRol, eliminar };
