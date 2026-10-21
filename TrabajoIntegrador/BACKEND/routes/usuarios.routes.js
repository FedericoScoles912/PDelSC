/**
 * usuarios.routes.js
 * Gestión de usuarios. Sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { idParam } from '../validators/commonSchemas.js';
import {
  crearUsuarioSchema, actualizarUsuarioSchema, estadoSchema, rolSchema, listarUsuariosQuery,
} from '../validators/usuarioSchemas.js';
import * as ctrl from '../controllers/usuarioController.js';

const router = Router();
router.use(authRequired, roleRequired(ROLES.ADMIN));

router.get('/', validate({ query: listarUsuariosQuery }), ctrl.listar);
router.get('/:id', validate({ params: idParam }), ctrl.obtener);
router.post('/', validate({ body: crearUsuarioSchema }), ctrl.crear);
router.put('/:id', validate({ params: idParam, body: actualizarUsuarioSchema }), ctrl.actualizar);
router.patch('/:id/estado', validate({ params: idParam, body: estadoSchema }), ctrl.cambiarEstado);
router.patch('/:id/rol', validate({ params: idParam, body: rolSchema }), ctrl.cambiarRol);
router.delete('/:id', validate({ params: idParam }), ctrl.eliminar);

export default router;
