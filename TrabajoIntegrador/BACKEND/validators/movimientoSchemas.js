/**
 * movimientoSchemas.js
 */
import { z } from 'zod';

export const movimientoSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: z.enum(['INGRESO', 'EGRESO', 'AJUSTE']),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  motivo: z.string().trim().max(255).nullable().optional(),
  referencia: z.string().trim().max(64).nullable().optional(),
});

export const listarMovimientosQuery = z.object({
  productoId: z.coerce.number().int().positive().optional(),
  tipo: z.enum(['INGRESO', 'EGRESO', 'AJUSTE']).optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
}).passthrough();

export default { movimientoSchema, listarMovimientosQuery };
