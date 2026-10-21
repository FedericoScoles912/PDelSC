/**
 * precios.routes.js
 * Gestión de precios e importación de listas desde Excel.
 *  - Historial: cualquier usuario autenticado.
 *  - Actualización manual: Administrador y Encargado de Depósito.
 *  - Importación de Excel: sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.js';
import { idParam } from '../validators/commonSchemas.js';
import { precioSchema } from '../validators/precioSchemas.js';
import { uploadExcel } from '../config/multer.js';
import * as ctrl from '../controllers/precioController.js';

const router = Router();
const editores = roleRequired(ROLES.ADMIN, ROLES.DEPOSITO);

router.get('/producto/:id/historial', authRequired, validate({ params: idParam }), ctrl.historial);
router.put('/producto/:id', authRequired, editores, validate({ params: idParam, body: precioSchema }), ctrl.actualizar);

router.post('/importar/preview', authRequired, roleRequired(ROLES.ADMIN), uploadExcel.single('archivo'), ctrl.vistaPrevia);
router.post('/importar/confirmar', authRequired, roleRequired(ROLES.ADMIN), uploadExcel.single('archivo'), ctrl.confirmar);

export default router;
