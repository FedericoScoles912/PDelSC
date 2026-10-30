/**
 * @file Rutas del dashboard (se montan en '/dashboard'). El middleware
 *       `autenticar` ya se aplica globalmente.
 * @module Server/rutas/dashboard.rutas
 */

import { Router } from 'express';

import { asyncHandler, responder } from '../utils/http.js';
import { resumen } from '../servicios/dashboard.servicio.js';

const router = Router();

router.get(
  '/resumen',
  asyncHandler(async (_req, res) => {
    const datos = await resumen();
    return responder(res, datos);
  })
);

export default router;
