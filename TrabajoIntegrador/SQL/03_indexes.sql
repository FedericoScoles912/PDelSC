-- ============================================================================
--  03_indexes.sql
--  Índices para acelerar búsquedas por código, medidas, equivalencias y texto.
-- ============================================================================

USE retenes_stock;

-- Usuarios / seguridad
CREATE INDEX idx_usuarios_rol        ON usuarios (rol_id);
CREATE INDEX idx_rt_usuario          ON refresh_tokens (usuario_id);
CREATE INDEX idx_rt_expira           ON refresh_tokens (expira_en);
CREATE INDEX idx_oauth_usuario       ON proveedores_oauth (usuario_id);

-- Productos
CREATE INDEX idx_productos_categoria ON productos (categoria_id);
CREATE INDEX idx_productos_giro      ON productos (giro);
CREATE INDEX idx_productos_precio    ON productos (precio_lista);

-- Búsqueda avanzada por medidas (EJE, ALOJ, ALT) con tolerancia
CREATE INDEX idx_productos_medidas   ON productos (eje_valor, aloj_valor, alt_valor);
CREATE INDEX idx_productos_eje       ON productos (eje_valor);
CREATE INDEX idx_productos_aloj      ON productos (aloj_valor);

-- Búsqueda de texto completo sobre aplicación (observaciones) y código
CREATE FULLTEXT INDEX ft_productos_texto ON productos (observaciones, codigo);

-- Equivalencias (OEM / A / S)
CREATE INDEX idx_equiv_codigo        ON equivalencias (codigo);
CREATE INDEX idx_equiv_tipo          ON equivalencias (tipo);

-- Movimientos / precios / auditoría
CREATE INDEX idx_mov_producto        ON movimientos_stock (producto_id);
CREATE INDEX idx_mov_tipo_fecha      ON movimientos_stock (tipo, creado_en);
CREATE INDEX idx_mov_usuario         ON movimientos_stock (usuario_id);
CREATE INDEX idx_hist_producto       ON historial_precios (producto_id);
CREATE INDEX idx_hist_fecha          ON historial_precios (creado_en);
CREATE INDEX idx_alertas_producto    ON alertas_stock (producto_id, resuelta);
CREATE INDEX idx_aud_usuario         ON auditoria (usuario_id);
CREATE INDEX idx_aud_entidad         ON auditoria (entidad, entidad_id);
CREATE INDEX idx_aud_fecha           ON auditoria (creado_en);
