-- ============================================================================
--  04_seed_roles_admin.sql
--  Datos semilla: roles, usuarios de prueba (uno por rol), categorías y config.
--
--  Contraseñas de prueba (todas cumplen la política mínima):
--    admin@retenes.com      -> Admin123!
--    deposito@retenes.com   -> Deposito123!
--    vendedor@retenes.com   -> Vendedor123!
--  (Los hashes corresponden a bcrypt con 10 rondas.)
-- ============================================================================

USE retenes_stock;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso total: usuarios, productos, stock, precios, reportes y auditoría.',
 JSON_ARRAY('usuarios.gestionar','roles.gestionar','productos.gestionar','categorias.gestionar',
            'stock.movimientos','precios.gestionar','precios.importar','reportes.ver',
            'auditoria.ver','configuracion.gestionar')),
('Encargado de Deposito', 'ABM de productos y gestión de stock. Sin gestión de usuarios.',
 JSON_ARRAY('productos.gestionar','categorias.gestionar','stock.movimientos','reportes.ver')),
('Vendedor', 'Consulta de catálogo, stock y precio. Puede registrar egresos por venta.',
 JSON_ARRAY('productos.ver','stock.movimientos.venta','reportes.ver'));

-- ---------------------------------------------------------------------------
-- Usuarios de prueba (email / contraseña indicados arriba)
-- ---------------------------------------------------------------------------
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id, activo, email_verificado) VALUES
('Administrador','General','admin@retenes.com',
 '$2a$10$khWvdiF8hXXFZj9X4XdBSu8dTtlM0NzDSIxu7NrRBID4b7ziQZD2O',
 (SELECT id FROM roles WHERE nombre='Administrador'), 1, 1),
('Ramiro','Lopez','deposito@retenes.com',
 '$2a$10$Z2Agxb0G8wgz7zqrBGYT0eO05wbaIhR0kio.e5tZLRCu4PTCZLgtO',
 (SELECT id FROM roles WHERE nombre='Encargado de Deposito'), 1, 1),
('Lucia','Perez','vendedor@retenes.com',
 '$2a$10$orcjOjmy./A3VamwMwK.wOBAnLG1SB.Ajb1p3kH1HGbAannPJVIzm',
 (SELECT id FROM roles WHERE nombre='Vendedor'), 1, 1);

-- ---------------------------------------------------------------------------
-- Categorías (tomadas de las secciones del Excel)
-- ---------------------------------------------------------------------------
INSERT INTO categorias (nombre, slug, descripcion, orden) VALUES
('Porta-retenes / Platinas / Sistemas de sellado','porta-retenes-platinas-sistemas','Porta-retenes, platinas y sistemas de sellado.',1),
('Retenes convencionales (radiales)','retenes-convencionales','Retenes radiales convencionales por medida.',2),
('Sellos de valvulas','sellos-de-valvulas','Sellos de válvula.',3),
('Línea pesada (lanzamiento)','linea-pesada','Nuevos lanzamientos para vehículos pesados.',4),
('Línea liviana & utilitarios','linea-liviana-utilitarios','Retenes para línea liviana y utilitarios.',5);

-- ---------------------------------------------------------------------------
-- Configuración general
-- ---------------------------------------------------------------------------
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_empresa','Retenes EMIC','Nombre mostrado en la interfaz.'),
('moneda','ARS','Moneda para precios y reportes.'),
('tolerancia_medidas','0.5','Tolerancia por defecto (mm) en la búsqueda avanzada por medidas.'),
('alertas_activas','1','Activar/desactivar el motor de alertas de stock mínimo.'),
('stock_minimo_default','5','Stock mínimo por defecto al crear un producto.'),
('vigencia_lista','2025-11-01','Fecha de vigencia de la lista de precios vigente.');
