/**
 * precioSchemas.js
 */
import { z } from 'zod';

export const precioSchema = z.object({
  precioLista: z.number().nonnegative().nullable(),
  proximoIngreso: z.boolean().optional(),
});

export const reporteQuery = z.object({
  desde: z.string().optional(),
  hasta: z.string().optional(),
  tipo: z.enum(['INGRESO', 'EGRESO', 'AJUSTE']).optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  soloStockBajo: z.coerce.boolean().optional(),
}).passthrough();

export default { precioSchema, reporteQuery };
