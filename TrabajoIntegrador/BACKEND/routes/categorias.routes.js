/**
 * categorias.routes.js
 * Lectura para cualquier usuario autenticado; ABM para Administrador y Encargado de Depósito.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { idParam } from '../validators/commonSchemas.js';
import { categoriaSchema, categoriaUpdateSchema } from '../validators/categoriaSchemas.js';
import * as ctrl from '../controllers/categoriaController.js';

const router = Router();
const editores = roleRequired(ROLES.ADMIN, ROLES.DEPOSITO);

router.get('/', authRequired, ctrl.listar);
router.get('/:id', authRequired, validate({ params: idParam }), ctrl.obtener);
router.post('/', authRequired, editores, validate({ body: categoriaSchema }), ctrl.crear);
router.put('/:id', authRequired, editores, validate({ params: idParam, body: categoriaUpdateSchema }), ctrl.actualizar);
router.delete('/:id', authRequired, roleRequired(ROLES.ADMIN), validate({ params: idParam }), ctrl.eliminar);

export default router;
