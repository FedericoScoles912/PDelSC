/**
 * env.js
 * Carga y valida las variables de entorno en un único lugar.
 * Toda la app importa la configuración desde aquí (nada de process.env disperso).
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// El .env vive en la raíz del proyecto (dos niveles arriba de BACKEND/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const num = (v, def) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : def);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: num(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: num(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'retenes_stock',
    connectionLimit: num(process.env.DB_CONNECTION_LIMIT, 10),
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()),
  },

  rateLimit: {
    windowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: num(process.env.RATE_LIMIT_MAX, 300),
  },

  oauth: {
    callbackBaseUrl: process.env.OAUTH_CALLBACK_BASE_URL || 'http://localhost:4000',
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
    facebook: { clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET },
    github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET },
  },

  import: {
    excelPath: process.env.EXCEL_PATH || './imports/Retenes_EMIC__Lista_de_Precios_-_Vigencia_01_Nov_2025.xlsx',
    logDir: process.env.IMPORT_LOG_DIR || './imports/logs',
  },
};

export default env;
