-- ============================================================================
--  03_indexes.sql  --  Índices secundarios adicionales
--  Target: TiDB Cloud / MySQL 8
-- ----------------------------------------------------------------------------
--  Los índices principales (PK, UNIQUE y los de uso frecuente) ya se declaran
--  inline en 02_tables.sql / 02b_tables_sin_fk.sql para que las tablas queden
--  listas en una sola pasada. Este script agrega los índices de apoyo
--  (búsqueda por texto, ordenamientos y reportes) de forma IDEMPOTENTE.
--
--  IMPORTANTE:
--   - TiDB soporta `CREATE INDEX IF NOT EXISTS` (MySQL 8 no). Por eso este
--     archivo está pensado para ejecutarse contra TiDB Cloud.
--   - NO se usa FULLTEXT (no garantizado en TiDB Cloud). La búsqueda por texto
--     se resuelve con índices B-Tree + `LIKE 'prefijo%'` / `LIKE '%texto%'`
--     paginado, y con filtros exactos por código/medidas (ver Docs/Guia_TiDB.md,
--     sección "Estrategia de búsqueda").
-- ============================================================================

USE `retenes_stock`;

-- Búsqueda de productos por rango de medidas (eje/aloj/alt) -----------------
CREATE INDEX IF NOT EXISTS `ix_productos_aloj_valor` ON `productos` (`aloj_valor`);
CREATE INDEX IF NOT EXISTS `ix_productos_alt_valor`  ON `productos` (`alt_valor`);
CREATE INDEX IF NOT EXISTS `ix_productos_uxb`        ON `productos` (`uxb`);

-- Filtro por código con prefijo (LIKE '1105%') -----------------------------
-- (el UNIQUE de `codigo` ya sirve; se agrega por claridad semántica de negocio)
-- CREATE INDEX IF NOT EXISTS `ix_productos_codigo` ON `productos` (`codigo`);

-- Productos bajo mínimo: índice compuesto para reportes --------------------
CREATE INDEX IF NOT EXISTS `ix_productos_stock_min` ON `productos` (`activo`, `stock`, `stock_minimo`);

-- Equivalencias: búsqueda por prefijo de código OEM/A/S --------------------
CREATE INDEX IF NOT EXISTS `ix_equiv_producto_tipo` ON `equivalencias` (`producto_id`, `tipo`);

-- Movimientos: reportes por rango de fecha + producto ---------------------
CREATE INDEX IF NOT EXISTS `ix_mov_producto_creado` ON `movimientos_stock` (`producto_id`, `creado_en`);
CREATE INDEX IF NOT EXISTS `ix_mov_creado_tipo`     ON `movimientos_stock` (`creado_en`, `tipo`);

-- Auditoría: filtros por entidad y rango de fecha -------------------------
CREATE INDEX IF NOT EXISTS `ix_aud_entidad_creado` ON `auditoria` (`entidad`, `creado_en`);
CREATE INDEX IF NOT EXISTS `ix_aud_accion`         ON `auditoria` (`accion`);

-- Tokens de refresco activos por usuario ----------------------------------
CREATE INDEX IF NOT EXISTS `ix_refresh_usuario_revocado` ON `refresh_tokens` (`usuario_id`, `revocado`);

-- Verificación de índices creados
SELECT
  TABLE_NAME  AS tabla,
  INDEX_NAME  AS indice,
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columnas
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;
