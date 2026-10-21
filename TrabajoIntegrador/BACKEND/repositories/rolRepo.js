/**
 * rolRepo.js
 * Acceso a datos de roles.
 */
import { query } from '../config/db.js';

export const list = async () => query(`SELECT id, nombre, descripcion, permisos FROM roles ORDER BY id`);

export const findById = async (id) => {
  const rows = await query(`SELECT * FROM roles WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

export const findByNombre = async (nombre) => {
  const rows = await query(`SELECT * FROM roles WHERE nombre = :nombre LIMIT 1`, { nombre });
  return rows[0] || null;
};

export default { list, findById, findByNombre };
