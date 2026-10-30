/**
 * @file Rutas de autenticación (se monta en '/auth').
 *       `autenticar` se aplica por ruta en este router (requisito explícito).
 * @module Server/rutas/auth
 */

import express from 'express';
import { z } from 'zod';

import { autenticar } from '../middlewares/autenticacion.js';
import { limiteAuth } from '../middlewares/rateLimit.js';
import { validarBody, validarParams } from '../middlewares/validacion.js';
import { asyncHandler, responder } from '../utils/http.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';
import { PROVEEDORES } from '../servicios/oauth.servicio.js';
import {
  actualizarPerfil,
  cambiarPassword,
  cerrarSesion,
  iniciarSesion,
  iniciarSesionOAuth,
  perfil,
  refrescar
} from '../servicios/auth.servicio.js';

const router = express.Router();

/** Cuerpo del login local. */
const esquemaLogin = z.object({
  email: z.string().min(1, 'El email es obligatorio.').email('El email no es válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.')
});

/** Parámetro de proveedor OAuth. */
const esquemaProveedor = z.object({
  proveedor: z.enum(PROVEEDORES, {
    errorMap: () => ({ message: 'El proveedor indicado no es válido.' })
  })
});

/** Cuerpo para login social. */
const esquemaOAuth = z.object({
  token: z.string().min(1, 'El token es obligatorio.')
});

/** Cuerpo para refrescar sesión. */
const esquemaRefrescar = z.object({
  refreshToken: z.string().min(1, 'El refresh token es obligatorio.')
});

/** Cuerpo del logout (el refresh token es opcional). */
const esquemaLogout = z.object({
  refreshToken: z.string().min(1, 'El refresh token es inválido.').optional()
});

/** Cuerpo para actualizar el propio perfil. */
const esquemaPerfil = z.object({
  nombre: z.string().min(1, 'El nombre no puede estar vacío.').optional(),
  apellido: z.string().min(1, 'El apellido no puede estar vacío.').optional(),
  telefono: z.string().min(1, 'El teléfono no puede estar vacío.').optional()
});

/** Cuerpo para cambiar la contraseña. */
const esquemaCambiarPassword = z.object({
  actual: z.string().min(1, 'Tenés que ingresar tu contraseña actual.'),
  nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
});

router.post(
  '/login',
  limiteAuth,
  validarBody(esquemaLogin),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const resultado = await iniciarSesion({
      email,
      password,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

router.post(
  '/oauth/:proveedor',
  limiteAuth,
  validarParams(esquemaProveedor),
  validarBody(esquemaOAuth),
  asyncHandler(async (req, res) => {
    const { proveedor } = req.params;
    const { token } = req.body;
    const resultado = await iniciarSesionOAuth({
      proveedor,
      token,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

router.post(
  '/refrescar',
  limiteAuth,
  validarBody(esquemaRefrescar),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const resultado = await refrescar({
      refreshToken,
      userAgent: req.get('user-agent') ?? null,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

router.post(
  '/logout',
  validarBody(esquemaLogout),
  asyncHandler(async (req, res) => {
    await cerrarSesion({ refreshToken: req.body.refreshToken });
    return responder(res, { ok: true });
  })
);

router.get(
  '/perfil',
  autenticar,
  asyncHandler(async (req, res) => {
    const datos = await perfil(req.usuario.sub);
    return responder(res, datos);
  })
);

router.patch(
  '/perfil',
  autenticar,
  validarBody(esquemaPerfil),
  asyncHandler(async (req, res) => {
    const datos = await actualizarPerfil(req.usuario.sub, req.body);
    return responder(res, datos);
  })
);

router.post(
  '/cambiar-password',
  autenticar,
  limiteAuth,
  validarBody(esquemaCambiarPassword),
  asyncHandler(async (req, res) => {
    const { actual, nueva } = req.body;
    await cambiarPassword(req.usuario.sub, { actual, nueva });
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'cambiar_password',
      entidad: 'auth',
      entidadId: req.usuario?.sub,
      ip: ipDe(req)
    });
    return responder(res, { ok: true });
  })
);

export default router;
