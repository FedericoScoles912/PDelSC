/**
 * commonSchemas.js
 * Esquemas Zod reutilizables.
 */
import { z } from 'zod';

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const password = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Za-z]/, 'Debe incluir al menos una letra')
  .regex(/\d/, 'Debe incluir al menos un número');

export const paginacion = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
}).passthrough();

export const email = z.string().trim().toLowerCase().email('Email inválido');

export default { idParam, password, paginacion, email };
