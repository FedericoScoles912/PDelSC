/**
 * reportes.routes.js
 * Reportes y exportación CSV. Acceso para Administrador, Encargado y Vendedor.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { reporteQuery } from '../validators/precioSchemas.js';
import * as ctrl from '../controllers/miscControllers.js';

const router = Router();
router.use(authRequired, roleRequired(ROLES.ADMIN, ROLES.DEPOSITO, ROLES.VENDEDOR));

router.get('/stock', validate({ query: reporteQuery }), ctrl.reporteStock);
router.get('/stock/export', validate({ query: reporteQuery }), ctrl.exportarStock);
router.get('/movimientos', validate({ query: reporteQuery }), ctrl.reporteMovimientos);
router.get('/movimientos/export', validate({ query: reporteQuery }), ctrl.exportarMovimientos);
router.get('/valor', ctrl.reporteValor);

export default router;
