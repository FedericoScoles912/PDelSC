/**
 * configuracion.routes.js
 * Parámetros generales del sistema.
 *  - Lectura pública: nombre de empresa, moneda, tolerancia, etc. (sin token).
 *  - Gestión: sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import * as ctrl from '../controllers/miscControllers.js';

const router = Router();

router.get('/publica', ctrl.configPublica);
router.get('/', authRequired, roleRequired(ROLES.ADMIN), ctrl.configListar);
router.put('/:clave', authRequired, roleRequired(ROLES.ADMIN), ctrl.configActualizar);

export default router;
