/**
 * movimientoRepo.js
 * Movimientos de stock. Escritura SIEMPRE dentro de una transacción con bloqueo
 * de la fila de stock (SELECT ... FOR UPDATE) para evitar condiciones de carrera.
 */
import { query } from '../config/db.js';

export const getStockForUpdate = async (conn, productoId) => {
  const [rows] = await conn.execute(
    `SELECT cantidad FROM stock WHERE producto_id = :id FOR UPDATE`,
    { id: productoId },
  );
  return rows[0]?.cantidad ?? null;
};

export const ensureStock = async (conn, productoId) => {
  await conn.execute(`INSERT IGNORE INTO stock (producto_id, cantidad) VALUES (:id, 0)`, { id: productoId });
};

export const setStock = async (conn, productoId, cantidad) => {
  await conn.execute(`UPDATE stock SET cantidad = :cantidad WHERE producto_id = :id`, { id: productoId, cantidad });
};

export const create = async (conn, m) => {
  const [result] = await conn.execute(
    `INSERT INTO movimientos_stock
      (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia, usuario_id)
     VALUES (:productoId, :tipo, :cantidad, :stockAnterior, :stockNuevo, :motivo, :referencia, :usuarioId)`,
    m,
  );
  return result.insertId;
};

export const list = async ({ limit, offset, productoId, tipo, desde, hasta }) => {
  const where = [];
  const params = { limit, offset };
  if (productoId) {
    where.push('m.producto_id = :productoId');
    params.productoId = productoId;
  }
  if (tipo) {
    where.push('m.tipo = :tipo');
    params.tipo = tipo;
  }
  if (desde) {
    where.push('m.creado_en >= :desde');
    params.desde = desde;
  }
  if (hasta) {
    where.push('m.creado_en <= :hasta');
    params.hasta = hasta;
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(
    `SELECT m.*, p.codigo AS producto_codigo, CONCAT(u.nombre,' ',u.apellido) AS usuario
     FROM movimientos_stock m
     LEFT JOIN productos p ON p.id = m.producto_id
     LEFT JOIN usuarios u  ON u.id = m.usuario_id
     ${clause}
     ORDER BY m.creado_en DESC
     LIMIT :limit OFFSET :offset`,
    params,
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM movimientos_stock m ${clause}`, params);
  return { rows, total };
};

export const ultimos = async (cantidad = 5) => {
  return query(
    `SELECT m.id, m.tipo, m.cantidad, m.stock_nuevo, m.creado_en,
            p.codigo AS producto_codigo, CONCAT(u.nombre,' ',u.apellido) AS usuario
     FROM movimientos_stock m
     LEFT JOIN productos p ON p.id = m.producto_id
     LEFT JOIN usuarios u  ON u.id = m.usuario_id
     ORDER BY m.creado_en DESC LIMIT :cantidad`,
    { cantidad },
  );
};

export default { getStockForUpdate, ensureStock, setStock, create, list, ultimos };
