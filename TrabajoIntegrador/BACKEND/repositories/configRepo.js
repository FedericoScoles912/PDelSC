/**
 * configRepo.js
 * Configuración general clave-valor.
 */
import { query } from '../config/db.js';

export const getAll = async () => {
  const rows = await query(`SELECT clave, valor, descripcion, actualizado_en FROM configuracion ORDER BY clave`);
  return rows;
};

export const get = async (clave) => {
  const rows = await query(`SELECT * FROM configuracion WHERE clave = :clave LIMIT 1`, { clave });
  return rows[0] || null;
};

export const set = async (clave, valor) => {
  await query(
    `INSERT INTO configuracion (clave, valor) VALUES (:clave, :valor)
     ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
    { clave, valor: String(valor) },
  );
};

export default { getAll, get, set };
