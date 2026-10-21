/**
 * usuarioSchemas.js
 */
import { z } from 'zod';
import { email, password } from './commonSchemas.js';

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  apellido: z.string().trim().min(2).max(80),
  email,
  password,
  rolId: z.number().int().positive(),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(2).max(80).optional(),
  apellido: z.string().trim().min(2).max(80).optional(),
  email: email.optional(),
  password: password.optional(),
  rolId: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
});

export const estadoSchema = z.object({ activo: z.boolean() });
export const rolSchema = z.object({ rolId: z.number().int().positive() });

export const listarUsuariosQuery = z.object({
  search: z.string().trim().optional(),
  rolId: z.coerce.number().int().positive().optional(),
  activo: z.coerce.number().optional(),
}).passthrough();

export default {
  crearUsuarioSchema, actualizarUsuarioSchema, estadoSchema, rolSchema, listarUsuariosQuery,
};
