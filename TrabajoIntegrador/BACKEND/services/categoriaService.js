/**
 * categoriaService.js
 */
import ApiError from '../utils/ApiError.js';
import * as repo from '../repositories/categoriaRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

const slugify = (s) =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 140);

export const listar = (soloActivas) => repo.list({ soloActivas });

export const obtener = async (id) => {
  const c = await repo.findById(id);
  if (!c) throw ApiError.notFound('Categoría no encontrada');
  return c;
};

export const crear = async (data, actor) => {
  const slug = slugify(data.nombre);
  if (await repo.findBySlug(slug)) throw ApiError.conflict('Ya existe una categoría con ese nombre');
  const id = await repo.create({ ...data, slug });
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'CREAR', entidad: 'categoria', entidadId: id, datosDespues: data, ip: actor?.ip,
  });
  return repo.findById(id);
};

export const actualizar = async (id, data, actor) => {
  const actual = await obtener(id);
  const payload = { ...data };
  if (data.nombre) payload.slug = slugify(data.nombre);
  await repo.update(id, payload);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ACTUALIZAR', entidad: 'categoria', entidadId: id,
    datosAntes: actual, datosDespues: payload, ip: actor?.ip,
  });
  return repo.findById(id);
};

export const eliminar = async (id, actor) => {
  const actual = await obtener(id);
  const productos = await repo.countProductos(id);
  if (productos > 0) {
    throw ApiError.conflict(`No se puede eliminar: la categoría tiene ${productos} productos asociados`);
  }
  await repo.remove(id);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ELIMINAR', entidad: 'categoria', entidadId: id, datosAntes: actual, ip: actor?.ip,
  });
  return { ok: true };
};

export default { listar, obtener, crear, actualizar, eliminar };
