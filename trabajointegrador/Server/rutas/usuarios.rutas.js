/**
 * @file Rutas de gestión de usuarios (se monta en '/usuarios').
 *       Todas las rutas exigen rol Administrador.
 * @module Server/rutas/usuarios
 */

import express from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarBody, validarParams, validarQuery } from '../middlewares/validacion.js';
import { asyncHandler, responder, responderCreado } from '../utils/http.js';
import { ipDe, registrar } from '../servicios/auditoria.servicio.js';
import {
  actualizar,
  cambiarActivo,
  crear,
  eliminar,
  listar,
  listarRoles,
  obtener
} from '../servicios/usuarios.servicio.js';

const router = express.Router();

/** Filtros y paginación del listado. */
const esquemaListar = z.object({
  q: z.string().min(1, 'El término de búsqueda no puede estar vacío.').optional(),
  rol: z.string().min(1, 'El rol no puede estar vacío.').optional(),
  activo: z.enum(['0', '1'], { errorMap: () => ({ message: 'El filtro activo debe ser 0 o 1.' }) }).optional(),
  pagina: z.coerce.number().int().positive('La página debe ser un entero positivo.').optional(),
  limite: z.coerce.number().int().positive('El límite debe ser un entero positivo.').optional()
});

/** Parámetro id numérico. */
const esquemaId = z.object({
  id: z.coerce.number().int('El id debe ser un número entero.').positive('El id debe ser un entero positivo.')
});

/** Cuerpo de creación de usuario. */
const esquemaCrear = z.object({
  rol: z.string().min(1, 'El rol es obligatorio.'),
  email: z.string().min(1, 'El email es obligatorio.').email('El email no es válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().min(1, 'El apellido no puede estar vacío.').optional(),
  telefono: z.string().min(1, 'El teléfono no puede estar vacío.').optional(),
  activo: z.boolean({ invalid_type_error: 'El estado activo debe ser verdadero o falso.' }).optional()
});

/** Cuerpo de actualización de usuario (no permite cambiar el email). */
const esquemaActualizar = z.object({
  nombre: z.string().min(1, 'El nombre no puede estar vacío.').optional(),
  apellido: z.string().min(1, 'El apellido no puede estar vacío.').optional(),
  telefono: z.string().min(1, 'El teléfono no puede estar vacío.').optional(),
  rol: z.string().min(1, 'El rol no puede estar vacío.').optional(),
  activo: z.boolean({ invalid_type_error: 'El estado activo debe ser verdadero o falso.' }).optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').optional()
});

/** Cuerpo para cambiar el estado activo. */
const esquemaActivo = z.object({
  activo: z.boolean({
    required_error: 'El estado activo es obligatorio.',
    invalid_type_error: 'El estado activo debe ser verdadero o falso.'
  })
});

router.get(
  '/roles',
  autorizar('admin'),
  asyncHandler(async (_req, res) => {
    const datos = await listarRoles();
    return responder(res, datos);
  })
);

router.get(
  '/',
  autorizar('admin'),
  validarQuery(esquemaListar),
  asyncHandler(async (req, res) => {
    const { datos, meta } = await listar(req.query);
    return responder(res, datos, meta);
  })
);

router.get(
  '/:id',
  autorizar('admin'),
  validarParams(esquemaId),
  asyncHandler(async (req, res) => {
    const datos = await obtener(req.params.id);
    return responder(res, datos);
  })
);

router.post(
  '/',
  autorizar('admin'),
  validarBody(esquemaCrear),
  asyncHandler(async (req, res) => {
    const usuario = await crear(req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'crear',
      entidad: 'usuario',
      entidadId: usuario.id,
      ip: ipDe(req)
    });
    return responderCreado(res, usuario);
  })
);

router.put(
  '/:id',
  autorizar('admin'),
  validarParams(esquemaId),
  validarBody(esquemaActualizar),
  asyncHandler(async (req, res) => {
    const usuario = await actualizar(req.params.id, req.body);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'usuario',
      entidadId: req.params.id,
      ip: ipDe(req)
    });
    return responder(res, usuario);
  })
);

router.patch(
  '/:id/activo',
  autorizar('admin'),
  validarParams(esquemaId),
  validarBody(esquemaActivo),
  asyncHandler(async (req, res) => {
    const usuario = await cambiarActivo(req.params.id, req.body.activo);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'actualizar',
      entidad: 'usuario',
      entidadId: req.params.id,
      detalle: { activo: req.body.activo },
      ip: ipDe(req)
    });
    return responder(res, usuario);
  })
);

router.delete(
  '/:id',
  autorizar('admin'),
  validarParams(esquemaId),
  asyncHandler(async (req, res) => {
    const resultado = await eliminar(req.params.id, req.usuario.sub);
    await registrar({
      usuarioId: req.usuario?.sub,
      accion: 'eliminar',
      entidad: 'usuario',
      entidadId: req.params.id,
      ip: ipDe(req)
    });
    return responder(res, resultado);
  })
);

export default router;
