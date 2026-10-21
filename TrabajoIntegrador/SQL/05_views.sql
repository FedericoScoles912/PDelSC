-- ============================================================================
--  05_views.sql
--  Vistas de apoyo para dashboard, reportes y consultas frecuentes.
-- ============================================================================

USE retenes_stock;

-- ---------------------------------------------------------------------------
-- v_stock_actual: producto + categoría + stock + valorización
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_stock_actual AS
SELECT
  p.id                AS producto_id,
  p.codigo,
  c.nombre            AS categoria,
  p.giro,
  p.eje_texto, p.aloj_texto, p.alt_texto,
  p.uxb,
  p.precio_lista,
  p.proximo_ingreso,
  COALESCE(s.cantidad, 0)                    AS stock,
  p.stock_minimo,
  (COALESCE(s.cantidad,0) <= p.stock_minimo) AS stock_bajo,
  (COALESCE(s.cantidad,0) * COALESCE(p.precio_lista,0)) AS valor_stock,
  p.activo
FROM productos p
LEFT JOIN stock s      ON s.producto_id = p.id
LEFT JOIN categorias c ON c.id = p.categoria_id;

-- ---------------------------------------------------------------------------
-- v_productos_stock_bajo: productos con stock por debajo del mínimo
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_productos_stock_bajo AS
SELECT *
FROM v_stock_actual
WHERE activo = 1 AND stock_bajo = 1;

-- ---------------------------------------------------------------------------
-- v_valor_stock: KPIs globales de valorización
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_valor_stock AS
SELECT
  COUNT(*)                                              AS total_productos,
  SUM(activo)                                           AS productos_activos,
  SUM(CASE WHEN stock_bajo = 1 THEN 1 ELSE 0 END)       AS productos_stock_bajo,
  SUM(CASE WHEN proximo_ingreso = 1 THEN 1 ELSE 0 END)  AS productos_proximo_ingreso,
  COALESCE(SUM(stock),0)                                AS unidades_totales,
  COALESCE(SUM(valor_stock),0)                          AS valor_total_stock
FROM v_stock_actual;

-- ---------------------------------------------------------------------------
-- v_ultimos_movimientos: bitácora legible de movimientos de stock
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ultimos_movimientos AS
SELECT
  m.id,
  m.tipo,
  m.cantidad,
  m.stock_anterior,
  m.stock_nuevo,
  m.motivo,
  m.referencia,
  m.creado_en,
  p.codigo              AS producto_codigo,
  CONCAT(u.nombre,' ',u.apellido) AS usuario
FROM movimientos_stock m
LEFT JOIN productos p ON p.id = m.producto_id
LEFT JOIN usuarios  u ON u.id = m.usuario_id;

-- ---------------------------------------------------------------------------
-- v_resumen_por_categoria: productos y valor por categoría
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_resumen_por_categoria AS
SELECT
  COALESCE(categoria,'Sin categoría') AS categoria,
  COUNT(*)                            AS productos,
  COALESCE(SUM(stock),0)              AS unidades,
  COALESCE(SUM(valor_stock),0)        AS valor
FROM v_stock_actual
GROUP BY categoria;
