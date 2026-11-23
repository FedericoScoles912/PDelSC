/**
 * @file Router raíz de la API. Monta todos los módulos bajo el prefijo /api/v1.
 *       `/auth` y `/health` son públicos; el resto exige access token.
 * @module Server/rutas
 */

import { Router } from 'express';

import { obtenerNegocioActual, verificarConexion } from '../config/db.js';
import { env } from '../config/env.js';
import { autenticar } from '../middlewares/autenticacion.js';
import { obtenerEstadoSincronizacion } from '../servicios/sincronizacion.servicio.js';
import { asyncHandler, responder } from '../utils/http.js';

import auditoriaRutas from './auditoria.rutas.js';
import authRutas from './auth.rutas.js';
import carritoRutas from './carrito.rutas.js';
import categoriasRutas from './categorias.rutas.js';
import dashboardRutas from './dashboard.rutas.js';
import importacionRutas from './importacion.rutas.js';
import preciosRutas from './precios.rutas.js';
import productosRutas from './productos.rutas.js';
import reportesRutas from './reportes.rutas.js';
import servidoresRutas from './servidores.rutas.js';
import stockRutas from './stock.rutas.js';
import usuariosRutas from './usuarios.rutas.js';

const api = Router();

// ---------------------------------------------------------------------------
//  Rutas públicas
// ---------------------------------------------------------------------------
api.get(
  '/health',
  asyncHandler(async (req, res) => {
    const negocioActivo = obtenerNegocioActual();
    if (req.query.db === '1') {
      const db = await verificarConexion(2);
      const estado = db.ok ? 'ok' : 'degradado';
      return responder(
        res,
        {
          estado,
          version: '1.2.0',
          ota: {
            habilitado: true,
            canal: 'production',
            runtimeVersion: '1.0.0'
          },
          negocioId: negocioActivo,
          entorno: env.nodeEnv,
          baseDeDatos: db.ok ? 'conectada' : 'sin conexión'
        },
        null,
        db.ok ? 200 : 503
      );
    }
    return responder(res, {
      estado: 'ok',
      version: '1.2.0',
      ota: {
        habilitado: true,
        canal: 'production',
        runtimeVersion: '1.0.0'
      },
      negocioId: negocioActivo,
      entorno: env.nodeEnv,
      baseDeDatos: 'conectada'
    });
  })
);

api.get(
  '/sincronizacion',
  asyncHandler(async (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    const estado = await obtenerEstadoSincronizacion();
    return responder(res, estado);
  })
);

api.use('/auth', authRutas);
api.use('/servidores', servidoresRutas);

// ---------------------------------------------------------------------------
//  Rutas protegidas (requieren access token válido)
// ---------------------------------------------------------------------------
api.use(autenticar);

api.use('/usuarios', usuariosRutas);
api.use('/categorias', categoriasRutas);
api.use('/productos', productosRutas);
api.use('/stock', stockRutas);
api.use('/precios', preciosRutas);
api.use('/dashboard', dashboardRutas);
api.use('/reportes', reportesRutas);
api.use('/carrito', carritoRutas);
api.use('/auditoria', auditoriaRutas);
api.use('/importacion', importacionRutas);

export default api;
