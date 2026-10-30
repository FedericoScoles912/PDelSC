/**
 * @file Rutas de importación del Excel de precios. Se montan en '/importacion'.
 *       Solo Administrador. Siempre en dos pasos: previsualizar y luego aplicar,
 *       para que el usuario confirme antes de escribir en la base.
 * @module Server/rutas/importacion
 */

import { Router } from 'express';

import { autorizar } from '../middlewares/autenticacion.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';
import { aplicar, previsualizar, ultimosLogs } from '../servicios/importacion.servicio.js';
import { asyncHandler, responder } from '../utils/http.js';

const router = Router();

router.use(autorizar('admin'));

router.get(
  '/logs',
  asyncHandler(async (_req, res) => {
    const datos = await ultimosLogs();
    return responder(res, datos);
  })
);

router.post(
  '/preview',
  asyncHandler(async (_req, res) => {
    const datos = await previsualizar();
    return responder(res, datos);
  })
);

router.post(
  '/aplicar',
  asyncHandler(async (req, res) => {
    const resumen = await aplicar({ usuarioId: req.usuario?.sub ?? null });
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'importar',
      entidad: 'import',
      detalle: resumen,
      ip: ipDe(req)
    });
    return responder(res, resumen);
  })
);

export default router;
