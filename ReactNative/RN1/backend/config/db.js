import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Pool de conexiones a MySQL utilizando mysql2 con promesas.
 * Soporta XAMPP, WAMP, LAMP y entornos de producción.
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'acceso_usuarios',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Función para comprobar la conexión inicial al arrancar el servidor
 */
export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Conectado exitosamente a MySQL (${process.env.DB_NAME || 'acceso_usuarios'}) en ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB ERROR] Error al conectar a la base de datos MySQL:', error.message);
    console.error('[DB SUGERENCIA] Asegúrate de que XAMPP/WAMP/LAMP esté iniciado con el servicio MySQL activo y que la base de datos exista.');
    return false;
  }
}
