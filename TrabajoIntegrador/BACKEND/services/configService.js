/**
 * configService.js
 * Lectura y escritura de parámetros de configuración.
 */
import ApiError from '../utils/ApiError.js';
import * as repo from '../repositories/configRepo.js';
import * as auditoriaRepo from '../repositories/auditoriaRepo.js';

export const listar = () => repo.getAll();

export const obtener = async (clave) => {
  const c = await repo.get(clave);
  if (!c) throw ApiError.notFound('Parámetro no encontrado');
  return c;
};

export const actualizar = async (clave, valor, actor) => {
  await repo.set(clave, valor);
  await auditoriaRepo.create({
    usuarioId: actor?.id, accion: 'ACTUALIZAR', entidad: 'configuracion',
    datosDespues: { clave, valor }, ip: actor?.ip,
  });
  return repo.get(clave);
};

/** Devuelve la configuración pública (sin datos sensibles). */
export const publica = async () => {
  const all = await repo.getAll();
  return Object.fromEntries(all.map((c) => [c.clave, c.valor]));
};

export default { listar, obtener, actualizar, publica };
