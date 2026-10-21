/**
 * movimientos.routes.js
 * Movimientos de stock (ingresos, egresos y ajustes).
 *  - Consulta: cualquier usuario autenticado.
 *  - Registro: Administrador, Encargado de Depósito y Vendedor (egreso por venta).
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { movimientoSchema, listarMovimientosQuery } from '../validators/movimientoSchemas.js';
import * as ctrl from '../controllers/movimientoController.js';

const router = Router();

router.get('/', authRequired, validate({ query: listarMovimientosQuery }), ctrl.listar);
router.get('/ultimos', authRequired, ctrl.ultimos);
router.post(
  '/',
  authRequired,
  roleRequired(ROLES.ADMIN, ROLES.DEPOSITO, ROLES.VENDEDOR),
  validate({ body: movimientoSchema }),
  ctrl.registrar,
);

export default router;
