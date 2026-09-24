// =============================================
// Módulo de conexión a base de datos PostgreSQL
// Utiliza el driver oficial 'pg' con Pool de conexiones
// =============================================

import pg from 'pg';

const { Pool } = pg;

// Configuración del pool de conexiones
// Los valores se obtienen desde variables de entorno
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Manejo de errores en conexiones del pool
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de conexiones PostgreSQL:', err);
    process.exit(-1);
});

export default pool;
