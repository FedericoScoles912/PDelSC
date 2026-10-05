import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno desde .env en /backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'acceso_usuarios',
  DB_PORT = 3306,
} = process.env;

/**
 * Usuarios de prueba para poblar la base de datos
 */
const SEED_USERS = [
  {
    nombre: 'Federico Scoles',
    correo: 'admin@empresa.com',
    usuario: 'admin',
    passwordPlano: 'admin123',
    rol: 'Administrador',
  },
  {
    nombre: 'Juan Pérez',
    correo: 'juan.perez@empresa.com',
    usuario: 'juan.perez',
    passwordPlano: 'clave456',
    rol: 'Editor',
  },
  {
    nombre: 'María López',
    correo: 'maria.lopez@empresa.com',
    usuario: 'maria.lopez',
    passwordPlano: 'secreto789',
    rol: 'Usuario',
  },
];

async function runSeed() {
  console.log('--- Iniciando script de Seed para Base de Datos ---');
  console.log(`Conectando a MySQL en ${DB_HOST}:${DB_PORT} como usuario "${DB_USER}"...`);

  let rootConnection;
  try {
    // 1. Conexión inicial sin especificar DB para asegurar que la DB exista
    rootConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`[OK] Base de datos "${DB_NAME}" verificada/creada.`);
  } catch (error) {
    console.error('[ERROR] Error conectando a MySQL o creando la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (rootConnection) await rootConnection.end();
  }

  // 2. Conectar a la base de datos específica
  let dbConnection;
  try {
    dbConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: Number(DB_PORT),
    });

    // 3. Crear tabla si no existe
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`usuarios\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(100) NOT NULL,
        \`correo\` VARCHAR(150) NOT NULL UNIQUE,
        \`usuario\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`rol\` VARCHAR(50) NOT NULL DEFAULT 'Usuario',
        \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await dbConnection.query(createTableQuery);
    console.log('[OK] Tabla "usuarios" verificada/creada.');

    // 4. Hashear contraseñas e insertar usuarios de prueba
    const saltRounds = 10;
    console.log('\nGenerando hashes con bcrypt e insertando usuarios:');

    for (const u of SEED_USERS) {
      const passwordHash = await bcrypt.hash(u.passwordPlano, saltRounds);

      const query = `
        INSERT INTO \`usuarios\` (\`nombre\`, \`correo\`, \`usuario\`, \`password_hash\`, \`rol\`)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`nombre\` = VALUES(\`nombre\`),
          \`password_hash\` = VALUES(\`password_hash\`),
          \`rol\` = VALUES(\`rol\`);
      `;

      await dbConnection.execute(query, [
        u.nombre,
        u.correo,
        u.usuario,
        passwordHash,
        u.rol,
      ]);

      console.log(` -> Usuario: ${u.usuario.padEnd(12)} | Password: ${u.passwordPlano.padEnd(12)} | Rol: ${u.rol}`);
    }

    console.log('\n[ÉXITO] Seed completado correctamente. Los usuarios ya están disponibles en MySQL.\n');
  } catch (error) {
    console.error('[ERROR] Error durante el proceso de seed:', error.message);
    process.exit(1);
  } finally {
    if (dbConnection) await dbConnection.end();
  }
}

runSeed();
