import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * Pool de conexiones reutilizable. Todas las queries del proyecto deben
 * pasar por acá y usar SIEMPRE placeholders (?) para evitar inyección SQL.
 */
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Devolver fechas como string evita desfases de zona horaria al serializar.
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
});

/**
 * Verifica que la base de datos sea alcanzable. No lanza: devuelve
 * true/false para poder informar el estado al iniciar el servidor.
 */
export async function verifyDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error(`[db] No se pudo conectar a MySQL: ${error.message}`);
    return false;
  }
}
