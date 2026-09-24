import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
  'FRONTEND_URL'
];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn('[env] Faltan variables de entorno (podés usar .env.example como base):', missing.join(', '));
}

export default {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
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
    accessSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    refreshCookieName: 'refresh_token',
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    meta: {
      clientId: process.env.META_CLIENT_ID,
      clientSecret: process.env.META_CLIENT_SECRET,
      callbackUrl: process.env.META_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackUrl: process.env.TWITTER_CALLBACK_URL,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackUrl: process.env.DISCORD_CALLBACK_URL,
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackUrl: process.env.TWITCH_CALLBACK_URL,
    },
  },
};
