/**
 * productos.routes.js
 * Catálogo y ABM de productos.
 *  - Lectura: cualquier usuario autenticado.
 *  - ABM: Administrador y Encargado de Depósito.
 *  - Baja: sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { idParam } from '../validators/commonSchemas.js';
import {
  productoSchema, productoUpdateSchema, buscarSchema, stockMinimoSchema, listarQuerySchema,
} from '../validators/productoSchemas.js';
import * as ctrl from '../controllers/productoController.js';

const router = Router();
const editores = roleRequired(ROLES.ADMIN, ROLES.DEPOSITO);

// OJO: '/buscar' debe declararse antes de '/:id'
router.get('/', authRequired, validate({ query: listarQuerySchema }), ctrl.listar);
router.get('/buscar', authRequired, validate({ query: buscarSchema }), ctrl.buscar);
router.get('/:id', authRequired, validate({ params: idParam }), ctrl.obtener);

router.post('/', authRequired, editores, validate({ body: productoSchema }), ctrl.crear);
router.put('/:id', authRequired, editores, validate({ params: idParam, body: productoUpdateSchema }), ctrl.actualizar);
router.patch('/:id/stock-minimo', authRequired, editores, validate({ params: idParam, body: stockMinimoSchema }), ctrl.setStockMinimo);
router.delete('/:id', authRequired, roleRequired(ROLES.ADMIN), validate({ params: idParam }), ctrl.eliminar);

export default router;
