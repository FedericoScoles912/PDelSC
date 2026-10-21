/**
 * import.routes.js
 * Importación masiva del catálogo desde Excel. Sólo Administrador.
 */
import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { roleRequired, ROLES } from '../middlewares/roles.js';
import { uploadExcel } from '../config/multer.js';
import * as ctrl from '../controllers/miscControllers.js';

const router = Router();
router.use(authRequired, roleRequired(ROLES.ADMIN));

router.post('/preview', uploadExcel.single('archivo'), ctrl.importarVistaPrevia);
router.post('/confirm', uploadExcel.single('archivo'), ctrl.importarConfirmar);

export default router;
