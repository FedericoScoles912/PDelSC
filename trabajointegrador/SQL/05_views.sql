-- ============================================================================
--  05_views.sql  --  Vistas de apoyo para reportes y dashboard
--  Target: TiDB Cloud / MySQL 8
-- ----------------------------------------------------------------------------
--  Vistas SIMPLES (sin CTE recursivas, sin funciones de ventana) para asegurar
--  compatibilidad total con TiDB Cloud. Idempotentes mediante DROP + CREATE.
-- ============================================================================

USE `retenes_stock`;

DROP VIEW IF EXISTS `vw_resumen_categoria`;
DROP VIEW IF EXISTS `vw_productos_bajo_minimo`;
DROP VIEW IF EXISTS `vw_stock_actual`;

-- ---------------------------------------------------------------------------
--  vw_stock_actual: catálogo con valor de stock calculado
-- ---------------------------------------------------------------------------
CREATE VIEW `vw_stock_actual` AS
SELECT
  p.`id`                                                        AS producto_id,
  p.`codigo`                                                    AS codigo,
  COALESCE(c.`nombre`, 'Sin categoría')                         AS categoria,
  p.`eje_texto`                                                 AS eje,
  p.`aloj_texto`                                                AS aloj,
  p.`alt_texto`                                                 AS alt,
  p.`giro`                                                      AS giro,
  p.`uxb`                                                       AS uxb,
  p.`stock`                                                     AS stock,
  p.`stock_minimo`                                              AS stock_minimo,
  p.`precio_lista`                                              AS precio_lista,
  p.`proximo_ingreso`                                           AS proximo_ingreso,
  p.`proximo_embarque`                                          AS proximo_embarque,
  (p.`stock` * COALESCE(p.`precio_lista`, 0))                   AS valor_stock,
  CASE WHEN p.`stock_minimo` > 0 AND p.`stock` <= p.`stock_minimo` THEN 1 ELSE 0 END AS bajo_minimo,
  p.`activo`                                                    AS activo,
  p.`creado_en`                                                 AS creado_en,
  p.`actualizado_en`                                            AS actualizado_en
FROM `productos` p
LEFT JOIN `categorias` c ON c.`id` = p.`categoria_id`;

-- ---------------------------------------------------------------------------
--  vw_productos_bajo_minimo: alertas de reposición
-- ---------------------------------------------------------------------------
CREATE VIEW `vw_productos_bajo_minimo` AS
SELECT
  `producto_id`,
  `codigo`,
  `categoria`,
  `eje`,
  `aloj`,
  `alt`,
  `stock`,
  `stock_minimo`,
  (`stock_minimo` - `stock`)        AS faltante,
  `precio_lista`,
  `proximo_ingreso`,
  `proximo_embarque`
FROM `vw_stock_actual`
WHERE `activo` = 1
  AND `stock_minimo` > 0
  AND `stock` <= `stock_minimo`;

-- ---------------------------------------------------------------------------
--  vw_resumen_categoria: KPIs por categoría
-- ---------------------------------------------------------------------------
CREATE VIEW `vw_resumen_categoria` AS
SELECT
  c.`id`                                                         AS categoria_id,
  c.`nombre`                                                     AS categoria,
  COUNT(p.`id`)                                                  AS total_productos,
  COALESCE(SUM(p.`stock`), 0)                                    AS stock_total,
  COALESCE(SUM(p.`stock` * COALESCE(p.`precio_lista`, 0)), 0)    AS valor_stock,
  COALESCE(SUM(CASE WHEN p.`stock` <= p.`stock_minimo` THEN 1 ELSE 0 END), 0) AS productos_bajo_minimo
FROM `categorias` c
LEFT JOIN `productos` p ON p.`categoria_id` = c.`id` AND p.`activo` = 1
GROUP BY c.`id`, c.`nombre`;

-- Verificación
SELECT * FROM `vw_resumen_categoria` ORDER BY `categoria`;
