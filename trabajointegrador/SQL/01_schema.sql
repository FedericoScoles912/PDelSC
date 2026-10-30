-- ============================================================================
--  01_schema.sql
--  Sistema de Control de Stock - Retenes y Sellos Automotrices (EMIC)
--  Target: MySQL 8 / TiDB Cloud (Starter / Serverless)
--  Orden de ejecución: 01 -> 02 (o 02b) -> 03 -> 04 -> 05 -> 06 -> (99 rollback)
-- ----------------------------------------------------------------------------
--  NOTAS TiDB
--  - TiDB Cloud ya provee una base de datos por defecto; igualmente este script
--    crea `retenes_stock` de forma idempotente para poder replicar el entorno
--    en MySQL local o en Workbench sin cambios.
--  - Charset obligatorio utf8mb4. Collation utf8mb4_general_ci (compatible con
--    TiDB Cloud y con JP/EMOJI; utf8mb4_bin se reserva para comparaciones
--    case-sensitive sobre códigos si se requiere).
--  - TiDB permite CREATE DATABASE (hasta ~100 por cluster en el plan gratuito).
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `retenes_stock`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `retenes_stock`;

-- Verificación rápida (debe devolver 'retenes_stock' y 'utf8mb4_general_ci')
SELECT
  DATABASE()                                        AS base_actual,
  @@character_set_database                          AS charset,
  @@collation_database                              AS collation,
  VERSION()                                         AS version_motor;
