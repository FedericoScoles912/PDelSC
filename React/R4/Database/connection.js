// =============================================
// Pool de conexiones MySQL mediante mysql2/promise.
// =============================================

import mysql from 'mysql2/promise';

// Configuración del pool de conexiones
// Los valores se obtienen desde variables de entorno
const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
    });

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return { rows, insertId: rows.insertId };
}

export default { query };
