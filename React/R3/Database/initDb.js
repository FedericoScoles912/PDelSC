import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  let connection;
  try {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    console.log(`📄 Leyendo schema MySQL desde: ${schemaPath}`);
    const sql = fs.readFileSync(schemaPath, 'utf8');

    const config = {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
      multipleStatements: true,
    };

    console.log(`⏳ Conectando a MySQL en ${config.host}:${config.port}...`);
    connection = await mysql.createConnection(config);

    console.log('⏳ Ejecutando schema en MySQL...');
    await connection.query(sql);

    console.log('✅ Base de datos "auth_system" y tabla "users" inicializadas correctamente en MySQL.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos MySQL:', error.message);
    if (error.code) {
      console.error(`   Código de error: ${error.code}`);
    }
    if (connection) {
      await connection.end().catch(() => {});
    }
    process.exit(1);
  }
}

initDb();
