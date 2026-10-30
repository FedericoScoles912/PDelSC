/**
 * @file Rutas de categorías. Se montan en '/categorias'.
 * @module Server/rutas/categorias.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarBody, validarParams, validarQuery } from '../middlewares/validacion.js';
import { registrar, ipDe } from '../servicios/auditoria.servicio.js';
import * as servicio from '../servicios/categorias.servicio.js';
import { asyncHandler, responder, responderCreado } from '../utils/http.js';

const router = Router();

const idPositivo = z.coerce
  .number({ invalid_type_error: 'El id debe ser numérico.' })
  .int('El id debe ser un número entero.')
  .positive('El id debe ser mayor que cero.');

const booleanoQuery = z
  .enum(['true', 'false', '1', '0'], { errorMap: () => ({ message: 'El valor debe ser true o false.' }) })
  .optional()
  .transform((valor) => (valor === undefined ? undefined : valor === 'true' || valor === '1'));

const esquemaParams = z.object({ id: idPositivo });

const esquemaQuery = z.object({ incluirInactivas: booleanoQuery });

const esquemaCrear = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio.', invalid_type_error: 'El nombre debe ser texto.' })
    .trim()
    .min(1, 'El nombre es obligatorio.'),
  orden: z
    .coerce.number({ invalid_type_error: 'El orden debe ser numérico.' })
    .int('El orden debe ser un número entero.')
    .min(0, 'El orden no puede ser negativo.')
    .optional()
});

const esquemaActualizar = z.object({
  nombre: z
    .string({ invalid_type_error: 'El nombre debe ser texto.' })
    .trim()
    .min(1, 'El nombre no puede estar vacío.')
    .optional(),
  orden: z
    .coerce.number({ invalid_type_error: 'El orden debe ser numérico.' })
    .int('El orden debe ser un número entero.')
    .min(0, 'El orden no puede ser negativo.')
    .optional(),
  activo: z.boolean({ invalid_type_error: 'El estado activo debe ser booleano.' }).optional()
});

router.get(
  '/',
  validarQuery(esquemaQuery),
  asyncHandler(async (req, res) => {
    const datos = await servicio.listar({ incluirInactivas: req.query.incluirInactivas });
    return responder(res, datos);
  })
);

router.get(
  '/:id',
  validarParams(esquemaParams),
  asyncHandler(async (req, res) => {
    const datos = await servicio.obtener(req.params.id);
    return responder(res, datos);
  })
);

router.post(
  '/',
  autorizar('admin', 'deposito'),
  validarBody(esquemaCrear),
  asyncHandler(async (req, res) => {
    const datos = await servicio.crear(req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'crear',
      entidad: 'categoria',
      entidadId: datos.id,
      detalle: req.body,
      ip: ipDe(req)
    });
    return responderCreado(res, datos);
  })
);

router.put(
  '/:id',
  autorizar('admin', 'deposito'),
  validarParams(esquemaParams),
  validarBody(esquemaActualizar),
  asyncHandler(async (req, res) => {
    const datos = await servicio.actualizar(req.params.id, req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'categoria',
      entidadId: req.params.id,
      detalle: req.body,
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

router.delete(
  '/:id',
  autorizar('admin'),
  validarParams(esquemaParams),
  asyncHandler(async (req, res) => {
    const datos = await servicio.eliminar(req.params.id);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'eliminar',
      entidad: 'categoria',
      entidadId: req.params.id,
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

export default router;
