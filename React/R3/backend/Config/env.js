import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn('[env] Faltan variables de entorno (podés usar .env.example como base):', missing.join(', '));
}

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auth_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  bcrypt: {
    rounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  },
};
