/**
 * @file Rutas de stock (se montan en '/stock'). El middleware `autenticar` ya
 *       se aplica globalmente, por lo que aquí sólo se autoriza por rol.
 * @module Server/rutas/stock.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarBody, validarQuery } from '../middlewares/validacion.js';
import { ApiError, asyncHandler, responder, responderCreado } from '../utils/http.js';
import {
  alertas,
  listarMovimientos,
  obtenerStockDeposito,
  registrarMovimiento
} from '../servicios/stock.servicio.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';

const router = Router();

/** Tipos de movimiento válidos. */
const tipomovimiento = z.enum(['ingreso', 'egreso', 'ajuste'], {
  errorMap: () => ({ message: 'El tipo debe ser ingreso, egreso o ajuste.' })
});

/** Esquema de filtros para listar movimientos. */
const esquemaListar = z.object({
  producto_id: z.coerce.number().int().positive().optional(),
  tipo: tipomovimiento.optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  usuario_id: z.coerce.number().int().positive().optional(),
  pagina: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().positive().optional()
});

/** Esquema del cuerpo para registrar un movimiento. */
const esquemaCrear = z.object({
  producto_id: z.coerce
    .number({ invalid_type_error: 'El producto es obligatorio.' })
    .int('El producto debe ser un entero.')
    .positive('El producto debe ser un entero positivo.'),
  tipo: tipomovimiento,
  cantidad: z.coerce
    .number({ invalid_type_error: 'La cantidad es obligatoria.' })
    .int('La cantidad debe ser un número entero.')
    .positive('La cantidad debe ser mayor a cero.'),
  motivo: z.string().max(255).optional(),
  referencia: z.string().max(64).optional()
});

router.get(
  '/movimientos',
  validarQuery(esquemaListar),
  asyncHandler(async (req, res) => {
    const { datos, meta } = await listarMovimientos(req.query);
    return responder(res, datos, meta);
  })
);

router.post(
  '/movimientos',
  autorizar('admin', 'deposito', 'vendedor'),
  validarBody(esquemaCrear),
  asyncHandler(async (req, res) => {
    const { producto_id, tipo, cantidad } = req.body;

    if (req.usuario?.rol === 'vendedor' && tipo !== 'egreso') {
      throw ApiError.prohibido('Solo podés registrar egresos por venta.');
    }

    const resultado = await registrarMovimiento(req.body, req.usuario?.sub ?? null);

    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'movimiento',
      entidad: 'movimiento',
      entidadId: resultado.movimiento.id,
      detalle: {
        producto_id,
        tipo,
        cantidad,
        stock_anterior: resultado.stockAnterior,
        stock_resultante: resultado.stockResultante
      },
      ip: ipDe(req)
    });

    return responderCreado(res, resultado);
  })
);

router.get(
  '/alertas',
  asyncHandler(async (_req, res) => {
    const datos = await alertas();
    return responder(res, datos);
  })
);

router.get(
  '/deposito',
  autorizar('admin', 'deposito'),
  asyncHandler(async (req, res) => {
    const { resumen, datos, meta } = await obtenerStockDeposito(req.query);
    return responder(res, { resumen, articulos: datos }, meta);
  })
);

export default router;
