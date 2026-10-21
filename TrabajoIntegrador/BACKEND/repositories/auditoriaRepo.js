/**
 * auditoriaRepo.js
 * Bitácora de auditoría (quién hizo qué y cuándo).
 */
import { query } from '../config/db.js';

export const create = async ({ usuarioId, accion, entidad, entidadId = null, datosAntes = null, datosDespues = null, ip = null }) => {
  try {
    await query(
      `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_antes, datos_despues, ip)
       VALUES (:usuarioId, :accion, :entidad, :entidadId, :datosAntes, :datosDespues, :ip)`,
      {
        usuarioId,
        accion,
        entidad,
        entidadId,
        datosAntes: datosAntes ? JSON.stringify(datosAntes) : null,
        datosDespues: datosDespues ? JSON.stringify(datosDespues) : null,
        ip,
      },
    );
  } catch {
    // La auditoría nunca debe romper la operación principal
  }
};

export const list = async ({ limit, offset, entidad, accion, usuarioId }) => {
  const where = [];
  const params = { limit, offset };
  if (entidad) {
    where.push('a.entidad = :entidad');
    params.entidad = entidad;
  }
  if (accion) {
    where.push('a.accion = :accion');
    params.accion = accion;
  }
  if (usuarioId) {
    where.push('a.usuario_id = :usuarioId');
    params.usuarioId = usuarioId;
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(
    `SELECT a.*, CONCAT(u.nombre,' ',u.apellido) AS usuario, u.email
     FROM auditoria a
     LEFT JOIN usuarios u ON u.id = a.usuario_id
     ${clause}
     ORDER BY a.creado_en DESC
     LIMIT :limit OFFSET :offset`,
    params,
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM auditoria a ${clause}`, params);
  return { rows, total };
};

export default { create, list };
