/**
 * categoriaRepo.js
 * Acceso a datos de categorías.
 */
import { query } from '../config/db.js';

export const list = async ({ soloActivas = false } = {}) => {
  const where = soloActivas ? 'WHERE activo = 1' : '';
  return query(`SELECT * FROM categorias ${where} ORDER BY orden, nombre`);
};

export const findById = async (id) => {
  const rows = await query(`SELECT * FROM categorias WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

export const findBySlug = async (slug) => {
  const rows = await query(`SELECT * FROM categorias WHERE slug = :slug LIMIT 1`, { slug });
  return rows[0] || null;
};

export const create = async ({ nombre, slug, descripcion, orden = 0 }) => {
  const result = await query(
    `INSERT INTO categorias (nombre, slug, descripcion, orden) VALUES (:nombre, :slug, :descripcion, :orden)`,
    { nombre, slug, descripcion, orden },
  );
  return result.insertId;
};

export const update = async (id, { nombre, slug, descripcion, orden, activo }) => {
  const result = await query(
    `UPDATE categorias SET
       nombre = COALESCE(:nombre, nombre),
       slug = COALESCE(:slug, slug),
       descripcion = COALESCE(:descripcion, descripcion),
       orden = COALESCE(:orden, orden),
       activo = COALESCE(:activo, activo)
     WHERE id = :id`,
    {
      id,
      nombre: nombre ?? null,
      slug: slug ?? null,
      descripcion: descripcion ?? null,
      orden: orden ?? null,
      activo: activo ?? null,
    },
  );
  return result.affectedRows;
};

export const remove = async (id) => {
  const result = await query(`DELETE FROM categorias WHERE id = :id`, { id });
  return result.affectedRows;
};

export const countProductos = async (id) => {
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM productos WHERE categoria_id = :id`, { id });
  return total;
};

export default { list, findById, findBySlug, create, update, remove, countProductos };
