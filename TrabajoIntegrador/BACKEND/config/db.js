/**
 * db.js
 * Pool de conexiones MySQL (mysql2/promise). Todas las consultas son
 * parametrizadas para prevenir SQL Injection. Expone helpers de transacción.
 */
import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: false,
  namedPlaceholders: true,
});

/**
 * Ejecuta una consulta parametrizada.
 * @param {string} sql
 * @param {Array|object} params
 * @returns {Promise<import('mysql2').QueryResult>}
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Ejecuta una función dentro de una transacción, con commit/rollback automático.
 * @template T
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Verifica que la conexión a la base de datos funcione. */
export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

export default pool;
