/**
 * productoSchemas.js
 * Validación de alta/edición y búsqueda avanzada de productos.
 */
import { z } from 'zod';

const opcionalNumero = z.number().finite().nullable().optional();

export const productoSchema = z.object({
  codigo: z.string().trim().min(1, 'El código es obligatorio').max(40),
  categoriaId: z.number().int().positive().nullable().optional(),
  lanzamiento: z.string().trim().max(80).nullable().optional(),
  ejeTexto: z.string().trim().max(40).nullable().optional(),
  ejeValor: opcionalNumero,
  alojTexto: z.string().trim().max(40).nullable().optional(),
  alojValor: opcionalNumero,
  altTexto: z.string().trim().max(40).nullable().optional(),
  altValor: opcionalNumero,
  giro: z.string().trim().max(16).nullable().optional(),
  uxb: z.number().int().positive().nullable().optional(),
  observaciones: z.string().trim().max(4000).nullable().optional(),
  precioLista: z.number().nonnegative().nullable().optional(),
  proximoIngreso: z.boolean().optional(),
  stockMinimo: z.number().int().min(0).optional(),
  stockInicial: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
  equivalencias: z
    .array(z.object({ tipo: z.enum(['OEM', 'A', 'S']), codigo: z.string().trim().min(1).max(64) }))
    .optional(),
});

export const productoUpdateSchema = productoSchema.partial();

export const buscarSchema = z.object({
  codigo: z.string().trim().optional(),
  eje: z.coerce.number().optional(),
  aloj: z.coerce.number().optional(),
  alt: z.coerce.number().optional(),
  tolerancia: z.coerce.number().min(0).max(20).optional(),
  oem: z.string().trim().optional(),
  texto: z.string().trim().optional(),
});

export const stockMinimoSchema = z.object({
  stockMinimo: z.number().int().min(0),
});

export const listarQuerySchema = z.object({
  categoriaId: z.coerce.number().int().positive().optional(),
  giro: z.string().trim().optional(),
  lanzamiento: z.string().trim().optional(),
  codigo: z.string().trim().optional(),
  texto: z.string().trim().optional(),
  activo: z.coerce.number().optional(),
  stockBajo: z.coerce.boolean().optional(),
}).passthrough();

export default { productoSchema, productoUpdateSchema, buscarSchema, stockMinimoSchema, listarQuerySchema };
