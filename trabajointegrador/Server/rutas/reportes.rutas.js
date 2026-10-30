/**
 * @file Rutas de reportes (se montan en '/reportes'). Todas exigen rol
 *       'admin' o 'deposito'. El middleware `autenticar` ya es global.
 * @module Server/rutas/reportes.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarQuery } from '../middlewares/validacion.js';
import { asyncHandler } from '../utils/http.js';
import { generarReporte } from '../servicios/reportes.servicio.js';

const router = Router();

/** Esquema del query para reportes sin rango de fechas. */
const esquemaSimple = z.object({
  formato: z
    .enum(['csv', 'xlsx'], { errorMap: () => ({ message: 'El formato debe ser csv o xlsx.' }) })
    .optional()
});

/** Esquema del query para reportes con rango de fechas. */
const esquemaConFechas = z.object({
  formato: z
    .enum(['csv', 'xlsx'], { errorMap: () => ({ message: 'El formato debe ser csv o xlsx.' }) })
    .optional(),
  desde: z.string().optional(),
  hasta: z.string().optional()
});

/**
 * Envía el reporte generado como descarga.
 * @param {import('express').Response} res
 * @param {{contenido:Buffer, nombreArchivo:string, contentType:string}} reporte
 * @returns {import('express').Response}
 */
function enviarReporte(res, reporte) {
  const { contenido, nombreArchivo, contentType } = reporte;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  return res.send(contenido);
}

router.get(
  '/productos',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaSimple),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('productos', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

router.get(
  '/stock',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaSimple),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('stock', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

router.get(
  '/movimientos',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaConFechas),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('movimientos', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

router.get(
  '/precios',
  autorizar('admin', 'deposito'),
  validarQuery(esquemaConFechas),
  asyncHandler(async (req, res) => {
    const reporte = await generarReporte('precios', {
      formato: req.query.formato,
      filtros: req.query
    });
    return enviarReporte(res, reporte);
  })
);

export default router;
