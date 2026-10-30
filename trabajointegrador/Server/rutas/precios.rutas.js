/**
 * @file Rutas de precios. Se montan en '/precios'.
 * @module Server/rutas/precios.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarBody, validarParams, validarQuery } from '../middlewares/validacion.js';
import { registrar, ipDe } from '../servicios/auditoria.servicio.js';
import * as servicio from '../servicios/precios.servicio.js';
import { asyncHandler, responder } from '../utils/http.js';

const router = Router();

const idPositivo = z.coerce
  .number({ invalid_type_error: 'El id debe ser numérico.' })
  .int('El id debe ser un número entero.')
  .positive('El id debe ser mayor que cero.');

const esquemaParams = z.object({ id: idPositivo });

const esquemaQueryHistorial = z.object({
  pagina: z.coerce.number().int('La página debe ser un entero.').min(1, 'La página debe ser mayor a 0.').optional(),
  limite: z.coerce.number().int('El límite debe ser un entero.').min(1, 'El límite debe ser mayor a 0.').optional()
});

const esquemaCambio = z.object({
  precioLista: z.coerce
    .number({
      required_error: 'El precio es obligatorio.',
      invalid_type_error: 'El precio debe ser numérico.'
    })
    .nonnegative('El precio no puede ser negativo.'),
  motivo: z.string().trim().max(255, 'El motivo no puede superar los 255 caracteres.').optional()
});

const esquemaAjusteMasivo = z.object({
  categoriaId: z.coerce.number().int('La categoría debe ser un entero.').positive('La categoría debe ser mayor que cero.').optional(),
  porcentaje: z.coerce.number({
    required_error: 'El porcentaje es obligatorio.',
    invalid_type_error: 'El porcentaje debe ser numérico.'
  }),
  redondearA: z.coerce
    .number()
    .int('Los decimales deben ser un entero.')
    .min(0, 'Los decimales deben estar entre 0 y 4.')
    .max(4, 'Los decimales deben estar entre 0 y 4.')
    .optional()
});

router.get(
  '/productos/:id/historial',
  validarParams(esquemaParams),
  validarQuery(esquemaQueryHistorial),
  asyncHandler(async (req, res) => {
    const { datos, meta } = await servicio.historial(req.params.id, req.query);
    return responder(res, datos, meta);
  })
);

router.patch(
  '/productos/:id',
  autorizar('admin'),
  validarParams(esquemaParams),
  validarBody(esquemaCambio),
  asyncHandler(async (req, res) => {
    const datos = await servicio.cambiarPrecio(req.params.id, req.body, req.usuario?.sub);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'producto',
      entidadId: req.params.id,
      detalle: {
        cambio: 'precio',
        precioAnterior: datos.precioAnterior,
        precioNuevo: datos.precioNuevo,
        motivo: req.body.motivo ?? null
      },
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

router.post(
  '/ajuste-masivo',
  autorizar('admin'),
  validarBody(esquemaAjusteMasivo),
  asyncHandler(async (req, res) => {
    const datos = await servicio.ajusteMasivo(req.body, req.usuario?.sub);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'producto',
      entidadId: null,
      detalle: {
        ajuste: 'masivo',
        porcentaje: datos.porcentaje,
        categoriaId: datos.categoriaId,
        afectados: datos.afectados
      },
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

export default router;
