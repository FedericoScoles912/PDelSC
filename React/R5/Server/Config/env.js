import dotenv from 'dotenv';

dotenv.config();

/**
 * Variables obligatorias. Si falta alguna, el servidor no debe arrancar
 * (fallar temprano es preferible a fallar en tiempo de request).
 */
const REQUIRED = ['JWT_SECRET'];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missing.join(', ')}. ` +
      'Copiá .env.example a .env y completá los valores.'
  );
}

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',

  // Origen permitido por CORS y base para armar los redirect del frontend.
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // URL pública del backend (para los callback URL de OAuth).
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'user_auth_system',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
