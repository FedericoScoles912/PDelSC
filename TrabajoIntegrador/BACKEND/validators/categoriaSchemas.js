/**
 * categoriaSchemas.js
 */
import { z } from 'zod';

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre muy corto').max(120),
  descripcion: z.string().trim().max(255).nullable().optional(),
  orden: z.number().int().min(0).optional(),
});

export const categoriaUpdateSchema = categoriaSchema.partial().extend({
  activo: z.boolean().optional(),
});

export default { categoriaSchema, categoriaUpdateSchema };
