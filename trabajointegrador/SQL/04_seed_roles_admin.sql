-- ============================================================================
--  04_seed_roles_admin.sql  --  Roles, usuarios de prueba y configuración base
--  Target: TiDB Cloud / MySQL 8
-- ----------------------------------------------------------------------------
--  Script IDEMPOTENTE: puede ejecutarse varias veces sin duplicar datos.
--  Las contraseñas están hasheadas con bcrypt (10 rondas). Los usuarios de
--  prueba son SOLO para desarrollo/demostración: cambiarlas antes de publicar.
--
--  Credenciales de prueba
--    admin@retenes.com     / Admin123!     -> Administrador
--    deposito@retenes.com  / Deposito123!  -> Encargado de depósito
--    vendedor@retenes.com  / Vendedor123!  -> Vendedor / Consulta
-- ============================================================================

USE `retenes_stock`;

-- ---------------------------------------------------------------------------
--  ROLES
-- ---------------------------------------------------------------------------
INSERT INTO `roles` (`codigo`, `nombre`, `descripcion`) VALUES
  ('admin',    'Administrador',        'ABM de usuarios y roles, productos, stock, importación, configuración, reportes y auditoría.'),
  ('deposito', 'Encargado de depósito','ABM de productos, ingresos/egresos/ajustes de stock, alertas y reportes. Sin gestión de usuarios.'),
  ('vendedor', 'Vendedor / Consulta',  'Lectura de catálogo, búsqueda por medidas/equivalencias/aplicación, stock y precio. Puede registrar egresos por venta.')
ON DUPLICATE KEY UPDATE
  `nombre`      = VALUES(`nombre`),
  `descripcion` = VALUES(`descripcion`);

-- ---------------------------------------------------------------------------
--  USUARIOS DE PRUEBA (contraseñas bcrypt)
--  `INSERT IGNORE` para no sobrescribir contraseñas cambiadas por el usuario.
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO `usuarios`
  (`rol_id`, `email`, `password_hash`, `nombre`, `apellido`, `activo`, `email_verificado`)
VALUES
  ((SELECT `id` FROM `roles` WHERE `codigo` = 'admin'    LIMIT 1), 'admin@retenes.com',    '$2a$10$mdGEB7BTzDwwGgYgZazEkenit/n0ajBoVAN799B7pT.t0LiPma/G2', 'Administrador', 'Sistema',  1, 1),
  ((SELECT `id` FROM `roles` WHERE `codigo` = 'deposito' LIMIT 1), 'deposito@retenes.com', '$2a$10$JaBLnT9sRIt50Kk6M/Hv3en69yRzZ64NflSe5Rv5JOb2atrgyxrW2', 'Encargado',     'Depósito', 1, 1),
  ((SELECT `id` FROM `roles` WHERE `codigo` = 'vendedor' LIMIT 1), 'vendedor@retenes.com', '$2a$10$CPqsqo.yl5aFH30PQFK/Mer.cDvNePnbsKKmITZyO6aKikWegD9QC', 'Vendedor',      'Consulta', 1, 1);

-- ---------------------------------------------------------------------------
--  CONFIGURACIÓN BASE
-- ---------------------------------------------------------------------------
INSERT INTO `configuracion` (`clave`, `valor`, `descripcion`) VALUES
  ('stock_minimo_default',   '5',      'Stock mínimo por defecto al crear un producto nuevo.'),
  ('moneda',                 'ARS',    'Moneda de la lista de precios.'),
  ('alerta_stock_activa',    '1',      'Activa las alertas de stock mínimo en el dashboard.'),
  ('lista_precios_vigencia', '2025-11-01', 'Vigencia de la última lista de precios importada.'),
  ('version_app',            '1.0.0',  'Versión del sistema de control de stock.')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`);

-- Verificación
SELECT
  r.`codigo` AS rol,
  u.`email`  AS usuario,
  u.`activo` AS activo
FROM `usuarios` u
JOIN `roles` r ON r.`id` = u.`rol_id`
ORDER BY r.`codigo`;
