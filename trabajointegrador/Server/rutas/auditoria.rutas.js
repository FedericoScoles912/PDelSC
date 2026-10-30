/**
 * @file Rutas de auditoría (se montan en '/auditoria'). Sólo Administrador.
 *       El middleware `autenticar` ya se aplica globalmente.
 * @module Server/rutas/auditoria.rutas
 */

import { Router } from 'express';
import { z } from 'zod';

import { autorizar } from '../middlewares/autenticacion.js';
import { validarQuery } from '../middlewares/validacion.js';
import { asyncHandler, responder } from '../utils/http.js';
import { listar } from '../servicios/auditoria.servicio.js';

const router = Router();

/** Esquema de filtros del listado de auditoría. */
const esquemaListar = z.object({
  usuario_id: z.coerce.number().int().positive().optional(),
  entidad: z.string().optional(),
  accion: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  pagina: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().positive().optional()
});

router.get(
  '/',
  autorizar('admin'),
  validarQuery(esquemaListar),
  asyncHandler(async (req, res) => {
    const { datos, meta } = await listar(req.query);
    return responder(res, datos, meta);
  })
);

export default router;
