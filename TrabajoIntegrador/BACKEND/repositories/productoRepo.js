/**
 * productoRepo.js
 * Acceso a datos de productos, equivalencias y stock (incluye búsqueda avanzada
 * por medidas con tolerancia, código, OEM y texto de aplicación).
 */
import { query } from '../config/db.js';

const BASE = `
  SELECT p.*, c.nombre AS categoria, COALESCE(s.cantidad, 0) AS stock
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN stock s      ON s.producto_id = p.id
`;

export const findById = async (id) => {
  const rows = await query(`${BASE} WHERE p.id = :id LIMIT 1`, { id });
  if (!rows[0]) return null;
  const producto = rows[0];
  producto.equivalencias = await query(
    `SELECT tipo, codigo FROM equivalencias WHERE producto_id = :id ORDER BY tipo, codigo`,
    { id },
  );
  return producto;
};

export const findByCodigo = async (codigo) => {
  const rows = await query(`SELECT id FROM productos WHERE codigo = :codigo LIMIT 1`, { codigo });
  return rows[0] || null;
};

const buildFilters = (f) => {
  const where = [];
  const params = {};
  if (f.activo !== undefined) {
    where.push('p.activo = :activo');
    params.activo = f.activo;
  }
  if (f.categoriaId) {
    where.push('p.categoria_id = :categoriaId');
    params.categoriaId = f.categoriaId;
  }
  if (f.giro) {
    where.push('p.giro = :giro');
    params.giro = f.giro;
  }
  if (f.lanzamiento) {
    where.push('p.lanzamiento LIKE :lanzamiento');
    params.lanzamiento = `%${f.lanzamiento}%`;
  }
  if (f.codigo) {
    where.push('p.codigo LIKE :codigo');
    params.codigo = `%${f.codigo}%`;
  }
  if (f.texto) {
    where.push('MATCH(p.observaciones, p.codigo) AGAINST (:texto IN NATURAL LANGUAGE MODE)');
    params.texto = f.texto;
  }
  if (f.stockBajo) {
    where.push('COALESCE(s.cantidad,0) <= p.stock_minimo');
  }
  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
};

export const list = async (f, { limit, offset }) => {
  const { clause, params } = buildFilters(f);
  const rows = await query(
    `${BASE} ${clause} ORDER BY p.codigo LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset },
  );
  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM productos p LEFT JOIN stock s ON s.producto_id = p.id ${clause}`,
    params,
  );
  return { rows, total };
};

/**
 * Búsqueda avanzada. Las medidas son opcionales y usan tolerancia (mm).
 * Todas las condiciones presentes se combinan con AND.
 * @param {{codigo?:string, eje?:number, aloj?:number, alt?:number, tolerancia?:number, oem?:string, texto?:string}} f
 */
export const buscarAvanzada = async (f, { limit, offset }) => {
  const where = ['p.activo = 1'];
  const params = {};
  const tol = f.tolerancia ?? 0.5;

  if (f.codigo) {
    where.push('p.codigo LIKE :codigo');
    params.codigo = `%${f.codigo}%`;
  }
  if (f.eje !== undefined && f.eje !== null) {
    where.push('p.eje_valor BETWEEN :ejeMin AND :ejeMax');
    params.ejeMin = f.eje - tol;
    params.ejeMax = f.eje + tol;
  }
  if (f.aloj !== undefined && f.aloj !== null) {
    where.push('p.aloj_valor BETWEEN :alojMin AND :alojMax');
    params.alojMin = f.aloj - tol;
    params.alojMax = f.aloj + tol;
  }
  if (f.alt !== undefined && f.alt !== null) {
    where.push('p.alt_valor BETWEEN :altMin AND :altMax');
    params.altMin = f.alt - tol;
    params.altMax = f.alt + tol;
  }
  if (f.oem) {
    where.push('EXISTS (SELECT 1 FROM equivalencias e WHERE e.producto_id = p.id AND e.codigo LIKE :oem)');
    params.oem = `%${f.oem}%`;
  }
  if (f.texto) {
    where.push('MATCH(p.observaciones, p.codigo) AGAINST (:texto IN NATURAL LANGUAGE MODE)');
    params.texto = f.texto;
  }

  const clause = `WHERE ${where.join(' AND ')}`;
  const rows = await query(
    `${BASE} ${clause} ORDER BY p.eje_valor, p.aloj_valor, p.alt_valor LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset },
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM productos p ${clause}`, params);
  return { rows, total };
};

export const create = async (conn, p) => {
  const [result] = await conn.execute(
    `INSERT INTO productos
      (codigo, categoria_id, lanzamiento, eje_texto, eje_valor, aloj_texto, aloj_valor,
       alt_texto, alt_valor, giro, uxb, observaciones, precio_lista, proximo_ingreso, stock_minimo)
     VALUES
      (:codigo, :categoriaId, :lanzamiento, :ejeTexto, :ejeValor, :alojTexto, :alojValor,
       :altTexto, :altValor, :giro, :uxb, :observaciones, :precioLista, :proximoIngreso, :stockMinimo)`,
    p,
  );
  return result.insertId;
};

export const update = async (conn, id, p) => {
  const [result] = await conn.execute(
    `UPDATE productos SET
       codigo = COALESCE(:codigo, codigo),
       categoria_id = :categoriaId,
       lanzamiento = :lanzamiento,
       eje_texto = :ejeTexto, eje_valor = :ejeValor,
       aloj_texto = :alojTexto, aloj_valor = :alojValor,
       alt_texto = :altTexto, alt_valor = :altValor,
       giro = :giro, uxb = :uxb, observaciones = :observaciones,
       precio_lista = :precioLista, proximo_ingreso = :proximoIngreso,
       stock_minimo = :stockMinimo, activo = :activo
     WHERE id = :id`,
    { ...p, id },
  );
  return result.affectedRows;
};

export const setPrecio = async (conn, id, precioLista, proximoIngreso = 0) => {
  await conn.execute(
    `UPDATE productos SET precio_lista = :precioLista, proximo_ingreso = :proximoIngreso WHERE id = :id`,
    { id, precioLista, proximoIngreso },
  );
};

export const setStockMinimo = async (id, stockMinimo) => {
  await query(`UPDATE productos SET stock_minimo = :stockMinimo WHERE id = :id`, { id, stockMinimo });
};

export const remove = async (id) => {
  const result = await query(`DELETE FROM productos WHERE id = :id`, { id });
  return result.affectedRows;
};

export const count = async () => {
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM productos`);
  return total;
};

/** Reemplaza el conjunto de equivalencias de un producto (dentro de una transacción). */
export const replaceEquivalencias = async (conn, productoId, equivalencias = []) => {
  await conn.execute(`DELETE FROM equivalencias WHERE producto_id = :id`, { id: productoId });
  for (const eq of equivalencias) {
    await conn.execute(
      `INSERT IGNORE INTO equivalencias (producto_id, tipo, codigo) VALUES (:id, :tipo, :codigo)`,
      { id: productoId, tipo: eq.tipo, codigo: eq.codigo },
    );
  }
};

/** Asegura una fila de stock para el producto (dentro de una transacción). */
export const ensureStock = async (conn, productoId, cantidadInicial = 0) => {
  await conn.execute(
    `INSERT IGNORE INTO stock (producto_id, cantidad) VALUES (:id, :cantidad)`,
    { id: productoId, cantidad: cantidadInicial },
  );
};

export default {
  findById, findByCodigo, list, buscarAvanzada, create, update, setPrecio, setStockMinimo,
  remove, count, replaceEquivalencias, ensureStock,
};
