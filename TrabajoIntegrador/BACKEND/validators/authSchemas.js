/**
 * authSchemas.js
 */
import { z } from 'zod';
import { password, email } from './commonSchemas.js';

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre muy corto').max(80),
  apellido: z.string().trim().min(2, 'Apellido muy corto').max(80),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const socialSchema = z.object({
  proveedor: z.enum(['google', 'facebook', 'github']),
  accessToken: z.string().min(10, 'Token del proveedor inválido'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token inválido'),
});

export const changePasswordSchema = z.object({
  actual: z.string().optional().default(''),
  nueva: password,
});

export default { registerSchema, loginSchema, socialSchema, refreshSchema, changePasswordSchema };
