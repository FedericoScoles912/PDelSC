/**
 * usuarioRepo.js
 * Acceso a datos de usuarios + rol asociado.
 */
import { query } from '../config/db.js';

const BASE = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.rol_id,
         u.activo, u.email_verificado, u.ultimo_login, u.creado_en, u.actualizado_en,
         r.nombre AS rol
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
`;

export const findByEmail = async (email) => {
  const rows = await query(`${BASE} WHERE u.email = :email LIMIT 1`, { email });
  return rows[0] || null;
};

export const findById = async (id) => {
  const rows = await query(`${BASE} WHERE u.id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

export const create = async ({ nombre, apellido, email, passwordHash, rolId, emailVerificado = 0 }) => {
  const result = await query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id, email_verificado)
     VALUES (:nombre, :apellido, :email, :passwordHash, :rolId, :emailVerificado)`,
    { nombre, apellido, email, passwordHash, rolId, emailVerificado },
  );
  return result.insertId;
};

export const update = async (id, fields) => {
  const map = {
    nombre: 'nombre',
    apellido: 'apellido',
    email: 'email',
    passwordHash: 'password_hash',
    rolId: 'rol_id',
    activo: 'activo',
    emailVerificado: 'email_verificado',
    ultimoLogin: 'ultimo_login',
  };
  const sets = [];
  const params = { id };
  for (const [k, col] of Object.entries(map)) {
    if (fields[k] !== undefined) {
      sets.push(`${col} = :${k}`);
      params[k] = fields[k];
    }
  }
  if (!sets.length) return 0;
  const result = await query(`UPDATE usuarios SET ${sets.join(', ')} WHERE id = :id`, params);
  return result.affectedRows;
};

export const remove = async (id) => {
  const result = await query(`DELETE FROM usuarios WHERE id = :id`, { id });
  return result.affectedRows;
};

export const list = async ({ limit, offset, search, rolId, activo }) => {
  const where = [];
  const params = { limit, offset };
  if (search) {
    where.push('(u.nombre LIKE :search OR u.apellido LIKE :search OR u.email LIKE :search)');
    params.search = `%${search}%`;
  }
  if (rolId) {
    where.push('u.rol_id = :rolId');
    params.rolId = rolId;
  }
  if (activo !== undefined) {
    where.push('u.activo = :activo');
    params.activo = activo;
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(`${BASE} ${clause} ORDER BY u.creado_en DESC LIMIT :limit OFFSET :offset`, params);
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM usuarios u ${clause}`, params);
  return { rows, total };
};

export default { findByEmail, findById, create, update, remove, list };
