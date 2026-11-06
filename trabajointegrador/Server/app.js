/**
 * @file Construcción de la aplicación Express (middlewares globales + rutas).
 *       Se separa de `server.js` para poder testear la app sin abrir un puerto.
 * @module Server/app
 */

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores.js';
import { limiteGeneral } from './middlewares/rateLimit.js';
import rutas from './rutas/index.js';

/**
 * Crea y configura la instancia de Express.
 * @returns {import('express').Express}
 */
export function crearApp() {
  const app = express();

  app.disable('x-powered-by');
  app.disable('etag');
  // Confía en el proxy (Render/Railway) para leer la IP real del cliente.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false
    })
  );

  const origenes = env.cors.origenes;
  app.use(
    cors({
      origin: (origen, callback) => {
        // Sin origen: apps nativas (APK), herramientas y health checks.
        if (!origen) return callback(null, true);
        if (
          origenes.includes('*') ||
          origenes.includes(origen) ||
          (!env.esProduccion && /^https?:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.)/.test(origen))
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true
    })
  );

  app.use(compression());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.esProduccion ? 'combined' : 'dev'));
  }

  app.use(limiteGeneral);

  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      datos: {
        servicio: 'Stocker — Sistema de Control de Stock',
        api: env.apiPrefix,
        estado: 'activo'
      }
    });
  });

  app.use(env.apiPrefix, rutas);

  // 404 y manejador central de errores (siempre al final).
  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
