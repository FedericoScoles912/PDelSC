/**
 * roles.routes.js
 * Catálogo de roles. Sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { idParam } from '../validators/commonSchemas.js';
import * as ctrl from '../controllers/rolController.js';

const router = Router();
router.use(authRequired, roleRequired(ROLES.ADMIN));

router.get('/', ctrl.listar);
router.get('/:id', validate({ params: idParam }), ctrl.obtener);

export default router;
