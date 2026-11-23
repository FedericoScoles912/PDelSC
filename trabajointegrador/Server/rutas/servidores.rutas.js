/**
 * @file Rutas públicas de autenticación y registro de Servidores Únicos por Negocio.
 *       No expone ningún listado de servidores para mantener ocultos a todos los
 *       negocios registrados en la base de datos.
 * @module Server/rutas/servidores.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { validarBody } from '../middlewares/validacion.js';
import {
  autenticarServidorNegocio,
  registrarServidorNegocio
} from '../servicios/servidores.servicio.js';
import { asyncHandler, responder, responderCreado } from '../utils/http.js';

const router = Router();

const esquemaAccederServidor = z.object({
  codigoServidor: z
    .string()
    .trim()
    .min(1, 'El Código Único (ID) del servidor es obligatorio.'),
  password: z.string().min(1, 'La contraseña del servidor es obligatoria.')
});

const esquemaRegistrarServidor = z.object({
  nombre: z.string().trim().min(1, 'El nombre del negocio es obligatorio.'),
  codigoServidor: z
    .string()
    .trim()
    .min(3, 'El Código Único (ID) del servidor debe tener al menos 3 caracteres.'),
  password: z
    .string()
    .min(4, 'La contraseña del servidor debe tener al menos 4 caracteres.'),
  urlServidor: z.string().trim().optional().nullable(),
  descripcion: z.string().trim().optional().nullable()
});

/**
 * Autentica un dispositivo contra un servidor de negocio específico usando
 * su Código Único (ID) y su Contraseña.
 */
router.post(
  '/acceder',
  validarBody(esquemaAccederServidor),
  asyncHandler(async (req, res) => {
    const servidor = await autenticarServidorNegocio({
      codigoServidor: req.body.codigoServidor,
      password: req.body.password
    });
    return responder(res, servidor);
  })
);

/**
 * Registra un nuevo servidor único para un negocio con su propio Código (ID) y Contraseña.
 */
router.post(
  '/registrar',
  validarBody(esquemaRegistrarServidor),
  asyncHandler(async (req, res) => {
    const servidor = await registrarServidorNegocio({
      nombre: req.body.nombre,
      codigoServidor: req.body.codigoServidor,
      password: req.body.password,
      urlServidor: req.body.urlServidor || '',
      descripcion: req.body.descripcion || ''
    });
    return responderCreado(res, servidor);
  })
);

export default router;
