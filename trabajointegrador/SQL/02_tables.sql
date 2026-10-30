-- ============================================================================
--  02_tables.sql  --  Tablas CON declaración de FOREIGN KEY
--  Target: MySQL 8 / TiDB Cloud
-- ----------------------------------------------------------------------------
--  IMPORTANTE (TiDB):
--    TiDB *parsea* las claves foráneas pero **no las hace cumplir** salvo que se
--    habilite de forma experimental. Por eso este script deja las FK declaradas
--    como documentación del modelo y la integridad referencial se valida en el
--    backend Node.js. Si tu cluster rechaza la sintaxis de FK, usá la variante
--    `02b_tables_sin_fk.sql` (idéntica, sin FK).
--  - Sin stored procedures / triggers / events (no soportados o restringidos).
--  - AUTO_INCREMENT no garantiza continuidad: nunca ordenar por `id`.
--  - Todas las tablas: ENGINE=InnoDB, CHARSET=utf8mb4, COLLATE=utf8mb4_general_ci.
-- ============================================================================

USE `retenes_stock`;

-- ---------------------------------------------------------------------------
--  roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(32)      NOT NULL,
  `nombre`      VARCHAR(64)      NOT NULL,
  `descripcion` VARCHAR(255)     NULL,
  `creado_en`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  usuarios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `rol_id`           TINYINT UNSIGNED NOT NULL,
  `email`            VARCHAR(190)     NOT NULL,
  `password_hash`    VARCHAR(255)     NULL COMMENT 'NULL si la cuenta se creó sólo por OAuth sin password local',
  `nombre`           VARCHAR(120)     NOT NULL,
  `apellido`         VARCHAR(120)     NULL,
  `telefono`         VARCHAR(40)      NULL,
  `activo`           TINYINT(1)       NOT NULL DEFAULT 1,
  `email_verificado` TINYINT(1)       NOT NULL DEFAULT 0,
  `ultimo_login_en`  DATETIME         NULL,
  `creado_en`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  KEY `ix_usuarios_rol` (`rol_id`),
  KEY `ix_usuarios_activo` (`activo`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  proveedores_oauth  (1 usuario -> N proveedores sociales)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `proveedores_oauth` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id`        BIGINT UNSIGNED NOT NULL,
  `proveedor`         VARCHAR(20)     NOT NULL COMMENT 'google | facebook | github',
  `proveedor_user_id` VARCHAR(191)    NOT NULL COMMENT 'sub / id devuelto por el proveedor',
  `email_proveedor`   VARCHAR(190)    NULL,
  `avatar_url`        VARCHAR(512)    NULL,
  `creado_en`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_oauth_proveedor_user` (`proveedor`, `proveedor_user_id`),
  KEY `ix_oauth_usuario` (`usuario_id`),
  CONSTRAINT `fk_oauth_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  refresh_tokens  (rotación + revocación; se guarda el HASH, nunca el token)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id`      BIGINT UNSIGNED NOT NULL,
  `token_hash`      CHAR(64)        NOT NULL COMMENT 'SHA-256 hex del refresh token',
  `reemplazado_por` CHAR(64)        NULL COMMENT 'hash del token que lo rotó',
  `expira_en`       DATETIME        NOT NULL,
  `revocado`        TINYINT(1)      NOT NULL DEFAULT 0,
  `user_agent`      VARCHAR(255)    NULL,
  `ip`              VARCHAR(45)     NULL,
  `creado_en`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refresh_token_hash` (`token_hash`),
  KEY `ix_refresh_usuario` (`usuario_id`),
  KEY `ix_refresh_expira` (`expira_en`),
  CONSTRAINT `fk_refresh_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  categorias  (filas-encabezado del Excel)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias` (
  `id`          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(150)      NOT NULL,
  `slug`        VARCHAR(160)      NOT NULL,
  `orden`       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `activo`      TINYINT(1)        NOT NULL DEFAULT 1,
  `creado_en`   DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_nombre` (`nombre`),
  UNIQUE KEY `uk_categorias_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  productos
--    - `codigo` es la clave única de negocio (puede ser numérico o alfanumérico).
--    - medidas: se guarda el TEXTO original (puede ser "-", "8,5/13,5", "172.0 / 139.7")
--      y, cuando es numérico, un DECIMAL para filtrar/ordenar con tolerancia ±.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id`              BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `codigo`          VARCHAR(32)       NOT NULL,
  `categoria_id`    SMALLINT UNSIGNED NULL,
  `lanzamiento`     TINYINT(1)        NOT NULL DEFAULT 0,
  `eje_texto`       VARCHAR(32)       NULL,
  `eje_valor`       DECIMAL(10,2)     NULL,
  `aloj_texto`      VARCHAR(32)       NULL,
  `aloj_valor`      DECIMAL(10,2)     NULL,
  `alt_texto`       VARCHAR(32)       NULL,
  `alt_valor`       DECIMAL(10,2)     NULL,
  `giro`            VARCHAR(10)       NULL COMMENT 'H | AH | LI | BI DIR | LISO',
  `uxb`             TINYINT UNSIGNED  NULL COMMENT 'unidades por bolsa/caja',
  `observaciones`   TEXT              NULL COMMENT 'aplicación (marca/modelo/motor)',
  `precio_lista`    DECIMAL(14,2)     NULL COMMENT 'NULL cuando la lista dice PRÓXIMO INGRESO o IDEM',
  `proximo_ingreso` TINYINT(1)        NOT NULL DEFAULT 0,
  `proximo_embarque` INT              NOT NULL DEFAULT 0 COMMENT 'PROX. EMB. de la lista',
  `stock`           INT               NOT NULL DEFAULT 0,
  `stock_minimo`    INT               NOT NULL DEFAULT 0,
  `activo`          TINYINT(1)        NOT NULL DEFAULT 1,
  `creado_en`       DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`  DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_productos_codigo` (`codigo`),
  KEY `ix_productos_categoria` (`categoria_id`),
  KEY `ix_productos_medidas` (`eje_valor`, `aloj_valor`, `alt_valor`),
  KEY `ix_productos_giro` (`giro`),
  KEY `ix_productos_lanzamiento` (`lanzamiento`),
  KEY `ix_productos_activo` (`activo`),
  KEY `ix_productos_creado` (`creado_en`),
  CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  equivalencias  (relación 1-N: OEM / A / S)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `equivalencias` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id` BIGINT UNSIGNED NOT NULL,
  `tipo`        VARCHAR(8)      NOT NULL COMMENT 'OEM | A | S',
  `codigo`      VARCHAR(64)     NOT NULL,
  `creado_en`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equiv_producto_tipo_codigo` (`producto_id`, `tipo`, `codigo`),
  KEY `ix_equiv_codigo` (`codigo`),
  KEY `ix_equiv_tipo` (`tipo`),
  CONSTRAINT `fk_equiv_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  movimientos_stock  (append-only; el stock vive en `productos.stock`)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `movimientos_stock` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id`      BIGINT UNSIGNED NOT NULL,
  `tipo`             VARCHAR(10)     NOT NULL COMMENT 'ingreso | egreso | ajuste',
  `cantidad`         INT             NOT NULL COMMENT 'siempre positiva; el signo lo define el tipo',
  `stock_anterior`   INT             NOT NULL,
  `stock_resultante` INT             NOT NULL,
  `motivo`           VARCHAR(255)    NULL,
  `referencia`       VARCHAR(64)     NULL COMMENT 'nro de remito / venta / ajuste',
  `usuario_id`       BIGINT UNSIGNED NULL,
  `creado_en`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_mov_producto` (`producto_id`),
  KEY `ix_mov_tipo` (`tipo`),
  KEY `ix_mov_usuario` (`usuario_id`),
  KEY `ix_mov_creado` (`creado_en`),
  CONSTRAINT `fk_mov_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  historial_precios
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historial_precios` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id`     BIGINT UNSIGNED NOT NULL,
  `precio_anterior` DECIMAL(14,2)   NULL,
  `precio_nuevo`    DECIMAL(14,2)   NULL,
  `origen`          VARCHAR(20)     NOT NULL DEFAULT 'importacion' COMMENT 'importacion | manual',
  `usuario_id`      BIGINT UNSIGNED NULL,
  `creado_en`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_precio_producto` (`producto_id`),
  KEY `ix_precio_creado` (`creado_en`),
  CONSTRAINT `fk_precio_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  auditoria
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT UNSIGNED NULL,
  `accion`     VARCHAR(64)     NOT NULL COMMENT 'crear | actualizar | eliminar | login | importar | movimiento',
  `entidad`    VARCHAR(64)     NOT NULL COMMENT 'producto | usuario | categoria | movimiento | import | auth',
  `entidad_id` VARCHAR(64)     NULL,
  `detalle`    JSON            NULL,
  `ip`         VARCHAR(45)     NULL,
  `creado_en`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_aud_usuario` (`usuario_id`),
  KEY `ix_aud_entidad` (`entidad`, `entidad_id`),
  KEY `ix_aud_creado` (`creado_en`),
  CONSTRAINT `fk_aud_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
--  configuracion  (clave-valor para parámetros de la app)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuracion` (
  `clave`          VARCHAR(64)  NOT NULL,
  `valor`          TEXT         NULL,
  `descripcion`    VARCHAR(255) NULL,
  `actualizado_en` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
