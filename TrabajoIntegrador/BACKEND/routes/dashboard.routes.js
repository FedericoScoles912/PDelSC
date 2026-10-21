/**
 * dashboard.routes.js
 * KPIs y alertas de stock. Cualquier usuario autenticado.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import * as ctrl from '../controllers/miscControllers.js';

const router = Router();
router.use(authRequired);

router.get('/', ctrl.dashboard);
router.get('/alertas', ctrl.alertas);

export default router;
