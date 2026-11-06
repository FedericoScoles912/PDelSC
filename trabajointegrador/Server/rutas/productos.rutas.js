/**
 * @file Rutas de productos. Se montan en '/productos'.
 *       ORDEN: '/buscar-medidas' y '/buscar' se declaran antes de '/:id'.
 * @module Server/rutas/productos.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarBody, validarParams, validarQuery } from '../middlewares/validacion.js';
import { registrar, ipDe } from '../servicios/auditoria.servicio.js';
import * as servicio from '../servicios/productos.servicio.js';
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

const enteroQuery = z.coerce
  .number({ invalid_type_error: 'El valor debe ser numérico.' })
  .int('El valor debe ser un número entero.')
  .optional();

const numeroQuery = z.coerce.number({ invalid_type_error: 'El valor debe ser numérico.' }).optional();

const esquemaParams = z.object({ id: idPositivo });
const esquemaParamsEquiv = z.object({ id: idPositivo, equivId: idPositivo });

const esquemaQueryListar = z.object({
  q: z.string().trim().optional(),
  categoria_id: enteroQuery,
  giro: z.string().trim().optional(),
  activo: booleanoQuery,
  lanzamiento: booleanoQuery,
  proximo_ingreso: booleanoQuery,
  stock_bajo: booleanoQuery,
  sin_stock: booleanoQuery,
  orden: z.string().trim().optional(),
  dir: z.string().trim().optional(),
  pagina: z.coerce.number().int('La página debe ser un entero.').min(1, 'La página debe ser mayor a 0.').optional(),
  limite: z.coerce.number().int('El límite debe ser un entero.').min(1, 'El límite debe ser mayor a 0.').optional()
});

const esquemaQueryMedidas = z.object({
  eje: numeroQuery,
  aloj: numeroQuery,
  alt: numeroQuery,
  tolerancia: z.coerce
    .number({ invalid_type_error: 'La tolerancia debe ser numérica.' })
    .nonnegative('La tolerancia no puede ser negativa.')
    .optional(),
  giro: z.string().trim().optional(),
  categoria_id: enteroQuery,
  activo: booleanoQuery
});

const esquemaQueryBuscar = z.object({
  q: z
    .string({ required_error: 'Ingresá un texto para buscar.', invalid_type_error: 'El texto debe ser una cadena.' })
    .trim()
    .min(1, 'Ingresá un texto para buscar.')
});

const esquemaCrear = z.object({
  codigo: z
    .string({ required_error: 'El código es obligatorio.', invalid_type_error: 'El código debe ser texto.' })
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(32, 'El código no puede superar los 32 caracteres.'),
  categoria: z.string().trim().optional(),
  categoria_id: z.coerce.number().int('La categoría debe ser un entero.').positive('La categoría debe ser mayor que cero.').optional(),
  lanzamiento: z.boolean({ invalid_type_error: 'El lanzamiento debe ser booleano.' }).optional(),
  eje_texto: z.string().trim().max(32, 'El texto del eje no puede superar los 32 caracteres.').optional(),
  eje_valor: numeroQuery,
  aloj_texto: z.string().trim().max(32, 'El texto del alojamiento no puede superar los 32 caracteres.').optional(),
  aloj_valor: numeroQuery,
  alt_texto: z.string().trim().max(32, 'El texto de la altura no puede superar los 32 caracteres.').optional(),
  alt_valor: numeroQuery,
  giro: z.string().trim().max(10, 'El giro no puede superar los 10 caracteres.').optional(),
  uxb: z.coerce.number().int('Las unidades por bolsa deben ser un entero.').min(0, 'Las unidades no pueden ser negativas.').optional(),
  observaciones: z.string().optional(),
  precio_lista: z.coerce.number().nonnegative('El precio no puede ser negativo.').optional(),
  proximo_ingreso: z.boolean({ invalid_type_error: 'El próximo ingreso debe ser booleano.' }).optional(),
  proximo_embarque: z.coerce.number().int('El próximo embarque debe ser un entero.').optional(),
  stock: z.coerce.number().int('El stock debe ser un entero.').optional(),
  stock_minimo: z.coerce.number().int('El stock mínimo debe ser un entero.').min(0, 'El stock mínimo no puede ser negativo.').optional()
});

const esquemaActualizar = esquemaCrear.omit({ codigo: true });

const esquemaActivo = z.object({
  activo: z.boolean({
    required_error: 'El estado activo es obligatorio.',
    invalid_type_error: 'El estado activo debe ser booleano.'
  })
});

const esquemaEquivalencia = z.object({
  tipo: z.enum(['OEM', 'A', 'S'], { errorMap: () => ({ message: 'El tipo debe ser OEM, A o S.' }) }),
  codigo: z
    .string({ required_error: 'El código es obligatorio.', invalid_type_error: 'El código debe ser texto.' })
    .trim()
    .min(1, 'El código es obligatorio.')
});

router.get(
  '/buscar-medidas',
  validarQuery(esquemaQueryMedidas),
  asyncHandler(async (req, res) => {
    const datos = await servicio.buscarPorMedidas(req.query);
    return responder(res, datos);
  })
);

router.get(
  '/buscar',
  validarQuery(esquemaQueryBuscar),
  asyncHandler(async (req, res) => {
    const datos = await servicio.buscar(req.query.q);
    return responder(res, datos);
  })
);

router.get(
  '/',
  validarQuery(esquemaQueryListar),
  asyncHandler(async (req, res) => {
    const { datos, meta } = await servicio.listar(req.query);
    return responder(res, datos, meta);
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

router.get(
  '/:id/equivalencias',
  validarParams(esquemaParams),
  asyncHandler(async (req, res) => {
    const datos = await servicio.listarEquivalencias(req.params.id);
    return responder(res, datos);
  })
);

router.post(
  '/',
  autorizar('admin', 'deposito', 'vendedor'),
  validarBody(esquemaCrear),
  asyncHandler(async (req, res) => {
    const datos = await servicio.crear(req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'crear',
      entidad: 'producto',
      entidadId: datos.id,
      detalle: req.body,
      ip: ipDe(req)
    });
    return responderCreado(res, datos);
  })
);

router.put(
  '/:id',
  autorizar('admin', 'deposito', 'vendedor'),
  validarParams(esquemaParams),
  validarBody(esquemaActualizar),
  asyncHandler(async (req, res) => {
    const datos = await servicio.actualizar(req.params.id, req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'producto',
      entidadId: req.params.id,
      detalle: req.body,
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

router.patch(
  '/:id/activo',
  autorizar('admin', 'deposito', 'vendedor'),
  validarParams(esquemaParams),
  validarBody(esquemaActivo),
  asyncHandler(async (req, res) => {
    const datos = await servicio.cambiarActivo(req.params.id, req.body.activo);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'producto',
      entidadId: req.params.id,
      detalle: { activo: req.body.activo },
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

router.delete(
  '/:id',
  autorizar('admin', 'deposito', 'vendedor'),
  validarParams(esquemaParams),
  asyncHandler(async (req, res) => {
    const datos = await servicio.eliminar(req.params.id);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'eliminar',
      entidad: 'producto',
      entidadId: req.params.id,
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

router.post(
  '/:id/equivalencias',
  autorizar('admin', 'deposito'),
  validarParams(esquemaParams),
  validarBody(esquemaEquivalencia),
  asyncHandler(async (req, res) => {
    const datos = await servicio.agregarEquivalencia(req.params.id, req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'crear',
      entidad: 'producto',
      entidadId: req.params.id,
      detalle: { equivalencia: req.body },
      ip: ipDe(req)
    });
    return responderCreado(res, datos);
  })
);

router.delete(
  '/:id/equivalencias/:equivId',
  autorizar('admin', 'deposito'),
  validarParams(esquemaParamsEquiv),
  asyncHandler(async (req, res) => {
    const datos = await servicio.eliminarEquivalencia(req.params.id, req.params.equivId);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'eliminar',
      entidad: 'producto',
      entidadId: req.params.id,
      detalle: { equivalenciaId: req.params.equivId },
      ip: ipDe(req)
    });
    return responder(res, datos);
  })
);

export default router;
