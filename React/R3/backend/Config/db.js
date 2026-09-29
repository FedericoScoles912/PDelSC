import mysql from 'mysql2/promise';
import env from './env.js';

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: env.db.waitForConnections,
  connectionLimit: env.db.connectionLimit,
  queueLimit: env.db.queueLimit,
  timezone: '+00:00',
  decimalNumbers: true,
});

/**
 * Ejecuta una consulta parametrizada (previene SQL injection).
 * @param {string} sql - Consulta SQL con placeholders "?"
 * @param {any[]} params - Valores para cada placeholder
 * @returns {Promise<{rows: any[], fields: any[]}>}
 */
export async function query(sql, params = []) {
  const [rows, fields] = await pool.execute(sql, params);
  return { rows, fields };
}

/**
 * Devuelve el primer resultado o null.
 */
export async function queryOne(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows.length ? rows[0] : null;
}

export default pool;
