/**
 * index.js
 * Router raíz del API. Monta cada recurso bajo /api/v1.
 */
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import rolesRoutes from './roles.routes.js';
import categoriasRoutes from './categorias.routes.js';
import productosRoutes from './productos.routes.js';
import movimientosRoutes from './movimientos.routes.js';
import preciosRoutes from './precios.routes.js';
import reportesRoutes from './reportes.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import importRoutes from './import.routes.js';
import auditoriaRoutes from './auditoria.routes.js';
import configuracionRoutes from './configuracion.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/roles', rolesRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/movimientos', movimientosRoutes);
router.use('/precios', preciosRoutes);
router.use('/reportes', reportesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/import', importRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/configuracion', configuracionRoutes);

export default router;
