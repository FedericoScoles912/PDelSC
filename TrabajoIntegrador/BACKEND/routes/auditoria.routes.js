/**
 * auditoria.routes.js
 * Bitácora de auditoría. Sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import * as ctrl from '../controllers/miscControllers.js';

const router = Router();
router.use(authRequired, roleRequired(ROLES.ADMIN));

router.get('/', ctrl.auditoria);

export default router;
