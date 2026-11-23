/**
 * @file Rutas del Carrito de Reposición sincronizado en vivo (montadas en '/carrito').
 *       Todos los dispositivos autenticados dentro del mismo servidor de negocio
 *       comparten el mismo carrito en tiempo real.
 * @module Server/rutas/carrito.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { validarBody } from '../middlewares/validacion.js';
import {
  actualizarDatosCarrito,
  agregarItemCarrito,
  cambiarCantidadItemCarrito,
  obtenerCarrito,
  quitarItemCarrito,
  sincronizarEstadoInicialCarrito,
  vaciarCarritoServidor
} from '../servicios/carrito.servicio.js';
import { invalidarCacheSincronizacion } from '../servicios/sincronizacion.servicio.js';
import { ApiError, asyncHandler, responder } from '../utils/http.js';

const router = Router();

const esquemaAgregarItem = z.object({
  producto_id: z.coerce.number().int().min(0).optional().default(0),
  codigo: z.string().trim().min(1, 'El código del producto es obligatorio.').max(64),
  categoria: z.string().trim().max(120).optional().nullable(),
  medidas: z.string().trim().max(120).optional().nullable(),
  stockActual: z.coerce.number().optional().default(0),
  stockMinimo: z.coerce.number().optional().default(0),
  faltante: z.coerce.number().optional(),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
  importador: z.string().trim().max(160).optional().default(''),
  emailImportador: z.string().trim().max(160).optional().default('')
});

const esquemaDatosImportador = z.object({
  importador: z.string().max(160).optional(),
  emailImportador: z.string().max(160).optional(),
  notas: z.string().max(2000).optional()
});

const esquemaCantidadBody = z.object({
  codigo: z.string().trim().min(1, 'El código del producto es obligatorio.').max(64),
  cantidad: z.coerce.number().int('La cantidad debe ser un entero.')
});

const esquemaCantidadParam = z.object({
  cantidad: z.coerce.number().int('La cantidad debe ser un entero.')
});

const esquemaSincInicial = z.object({
  importador: z.string().max(160).optional().default(''),
  emailImportador: z.string().max(160).optional().default(''),
  notas: z.string().max(2000).optional().default(''),
  items: z.array(esquemaAgregarItem).optional().default([])
});

/** GET /carrito -> Devuelve el carrito compartido actual del negocio activo. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const carrito = await obtenerCarrito();
    return responder(res, carrito);
  })
);

/** POST /carrito/items -> Agrega un producto (o incrementa su cantidad) en vivo. */
router.post(
  '/items',
  validarBody(esquemaAgregarItem),
  asyncHandler(async (req, res) => {
    const carrito = await agregarItemCarrito(req.body, req.usuario?.sub ?? null);
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** PATCH /carrito/items -> Cambia la cantidad de un ítem usando código en el cuerpo (seguro para códigos con '/'). */
router.patch(
  '/items',
  validarBody(esquemaCantidadBody),
  asyncHandler(async (req, res) => {
    const carrito = await cambiarCantidadItemCarrito(
      req.body.codigo,
      req.body.cantidad,
      req.usuario?.sub ?? null
    );
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** PATCH /carrito/items/:codigo -> Cambia la cantidad de un ítem por parámetro de ruta. */
router.patch(
  '/items/:codigo',
  validarBody(esquemaCantidadParam),
  asyncHandler(async (req, res) => {
    const carrito = await cambiarCantidadItemCarrito(
      req.params.codigo,
      req.body.cantidad,
      req.usuario?.sub ?? null
    );
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** DELETE /carrito/items -> Quita un producto usando query `?codigo=...` o body `{ codigo }`. */
router.delete(
  '/items',
  asyncHandler(async (req, res) => {
    const codigo = String(req.query?.codigo ?? req.body?.codigo ?? '').trim();
    if (!codigo) {
      throw ApiError.solicitudInvalida('Indicá el código del producto a quitar.');
    }
    const carrito = await quitarItemCarrito(codigo, req.usuario?.sub ?? null);
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** DELETE /carrito/items/:codigo -> Quita un producto específico por parámetro de ruta. */
router.delete(
  '/items/:codigo',
  asyncHandler(async (req, res) => {
    const carrito = await quitarItemCarrito(req.params.codigo, req.usuario?.sub ?? null);
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** PATCH /carrito/datos -> Actualiza importador, email y observaciones del carrito. */
router.patch(
  '/datos',
  validarBody(esquemaDatosImportador),
  asyncHandler(async (req, res) => {
    const carrito = await actualizarDatosCarrito(req.body, req.usuario?.sub ?? null);
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** POST /carrito/sincronizar-inicial -> Migra ítems locales previos si el servidor aún está en versión 0. */
router.post(
  '/sincronizar-inicial',
  validarBody(esquemaSincInicial),
  asyncHandler(async (req, res) => {
    const carrito = await sincronizarEstadoInicialCarrito(req.body, req.usuario?.sub ?? null);
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

/** DELETE /carrito -> Vacía todos los productos del carrito del negocio activo. */
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const carrito = await vaciarCarritoServidor(req.usuario?.sub ?? null);
    invalidarCacheSincronizacion();
    return responder(res, carrito);
  })
);

export default router;
