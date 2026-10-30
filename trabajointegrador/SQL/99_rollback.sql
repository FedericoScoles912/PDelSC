-- ============================================================================
--  99_rollback.sql  --  Elimina todos los objetos creados por los scripts
--  Target: TiDB Cloud / MySQL 8
-- ----------------------------------------------------------------------------
--  ATENCIÓN: destruye TODOS los datos del sistema de stock.
--  El orden respeta las dependencias (vistas -> tablas hijas -> tablas padre).
--  Es idempotente: puede ejecutarse aunque falten objetos.
-- ============================================================================

USE `retenes_stock`;

-- 1) Vistas
DROP VIEW IF EXISTS `vw_resumen_categoria`;
DROP VIEW IF EXISTS `vw_productos_bajo_minimo`;
DROP VIEW IF EXISTS `vw_stock_actual`;

-- 2) Tablas hijas (con más dependencias)
DROP TABLE IF EXISTS `auditoria`;
DROP TABLE IF EXISTS `historial_precios`;
DROP TABLE IF EXISTS `movimientos_stock`;
DROP TABLE IF EXISTS `equivalencias`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `proveedores_oauth`;
DROP TABLE IF EXISTS `productos`;

-- 3) Tablas padre
DROP TABLE IF EXISTS `configuracion`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `roles`;

-- 4) Base de datos (descomentar para eliminar por completo)
-- DROP DATABASE IF EXISTS `retenes_stock`;

-- Verificación: no deberían quedar tablas del sistema
SELECT
  TABLE_NAME AS tabla_restante
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
