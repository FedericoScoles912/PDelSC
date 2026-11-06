/**
 * @file Rutas de importación del Excel de precios. Se montan en '/importacion'.
 *       Solo Administrador. Permite listar archivos Excel disponibles, subir un
 *       archivo `.xlsx` específico, previsualizar su impacto y aplicarlo en TiDB.
 * @module Server/rutas/importacion
 */

import { Router } from 'express';

import { autorizar } from '../middlewares/autenticacion.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';
import {
  aplicar,
  listarArchivosExcel,
  previsualizar,
  subirArchivoExcel,
  ultimosLogs
} from '../servicios/importacion.servicio.js';
import { asyncHandler, responder } from '../utils/http.js';

const router = Router();

router.use(autorizar('admin'));

router.get(
  '/archivos',
  asyncHandler(async (_req, res) => {
    const datos = await listarArchivosExcel();
    return responder(res, datos);
  })
);

router.post(
  '/subir',
  asyncHandler(async (req, res) => {
    const { nombre, contenidoBase64, hoja } = req.body ?? {};
    const datos = await subirArchivoExcel({ nombre, contenidoBase64, hoja });
    return responder(res, datos);
  })
);

router.get(
  '/logs',
  asyncHandler(async (_req, res) => {
    const datos = await ultimosLogs();
    return responder(res, datos);
  })
);

router.post(
  '/preview',
  asyncHandler(async (req, res) => {
    const { archivo, hoja } = req.body ?? {};
    const datos = await previsualizar({ archivo, hoja });
    return responder(res, datos);
  })
);

router.post(
  '/aplicar',
  asyncHandler(async (req, res) => {
    const { archivo, hoja } = req.body ?? {};
    const resumen = await aplicar({
      archivo,
      hoja,
      usuarioId: req.usuario?.sub ?? null
    });
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
