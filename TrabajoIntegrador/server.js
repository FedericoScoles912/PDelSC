/**
 * server.js
 * Punto de entrada del backend (Node.js + Express, ES Modules).
 *
 * Sistema de Control de Stock - Retenes EMIC
 * API REST versionada en /api/v1
 *
 * Variables de entorno: ver .env.example (copiar a .env en la raíz del proyecto).
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './BACKEND/config/env.js';
import logger from './BACKEND/config/logger.js';
import { pool, testConnection } from './BACKEND/config/db.js';
import routes from './BACKEND/routes/index.js';
import { notFound, errorHandler } from './BACKEND/middlewares/error.js';
import { globalLimiter } from './BACKEND/middlewares/rateLimit.js';

const app = express();

// ------------------------------- Seguridad --------------------------------
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: si CORS_ORIGIN contiene '*', reflejamos el origen de la petición
// (cómodo para Expo Go durante el desarrollo).
const corsOrigin = env.cors.origin.includes('*') ? true : env.cors.origin;
app.use(cors({ origin: corsOrigin, credentials: true }));

// ------------------------------- Parsers ----------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ------------------------------- Logging ----------------------------------
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// --------------------------- Rate limiting global -------------------------
app.use(globalLimiter);

// ------------------------------- Rutas base -------------------------------
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    data: {
      name: 'Retenes EMIC - Sistema de Control de Stock',
      version: '1.0.0',
      entorno: env.nodeEnv,
      api: env.apiPrefix,
      docs: 'Ver README.md (sección API)',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'up', ts: new Date().toISOString() } });
});

// ------------------------------- API v1 -----------------------------------
app.use(env.apiPrefix, routes);

// --------------------------- 404 + Manejo errores -------------------------
app.use(notFound);
app.use(errorHandler);

// ------------------------------- Arranque ---------------------------------
const server = app.listen(env.port, async () => {
  logger.info(`API Retenes EMIC escuchando en http://localhost:${env.port}${env.apiPrefix}`);
  try {
    await testConnection();
    logger.info(`Conexión a MySQL OK (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (err) {
    logger.warn(
      `Sin conexión a MySQL: ${err.message}. Revisá el .env y que el servidor MySQL esté levantado y con los scripts SQL ejecutados.`,
    );
  }
});

// --------------------------- Apagado ordenado -----------------------------
const shutdown = (signal) => {
  logger.info(`${signal} recibido. Cerrando servidor...`);
  server.close(async () => {
    await pool.end().catch(() => {});
    logger.info('Servidor cerrado.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => logger.error('UnhandledRejection:', reason));
process.on('uncaughtException', (err) => logger.error('UncaughtException:', err));

export default app;
