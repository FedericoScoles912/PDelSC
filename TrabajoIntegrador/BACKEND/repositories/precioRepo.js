/**
 * precioRepo.js
 * Historial de cambios de precio.
 */
import { query } from '../config/db.js';

export const add = async (conn, { productoId, precioAnterior, precioNuevo, origen = 'MANUAL', usuarioId = null }) => {
  const [result] = await conn.execute(
    `INSERT INTO historial_precios (producto_id, precio_anterior, precio_nuevo, origen, usuario_id)
     VALUES (:productoId, :precioAnterior, :precioNuevo, :origen, :usuarioId)`,
    { productoId, precioAnterior, precioNuevo, origen, usuarioId },
  );
  return result.insertId;
};

export const historialPorProducto = async (productoId, { limit = 50, offset = 0 } = {}) => {
  const rows = await query(
    `SELECT h.*, CONCAT(u.nombre,' ',u.apellido) AS usuario
     FROM historial_precios h
     LEFT JOIN usuarios u ON u.id = h.usuario_id
     WHERE h.producto_id = :productoId
     ORDER BY h.creado_en DESC
     LIMIT :limit OFFSET :offset`,
    { productoId, limit, offset },
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM historial_precios WHERE producto_id = :productoId`, {
    productoId,
  });
  return { rows, total };
};

export const ultimos = async (limit = 10) => {
  return query(
    `SELECT h.id, h.precio_anterior, h.precio_nuevo, h.origen, h.creado_en,
            p.codigo AS producto_codigo
     FROM historial_precios h
     JOIN productos p ON p.id = h.producto_id
     ORDER BY h.creado_en DESC LIMIT :limit`,
    { limit },
  );
};

export default { add, historialPorProducto, ultimos };
