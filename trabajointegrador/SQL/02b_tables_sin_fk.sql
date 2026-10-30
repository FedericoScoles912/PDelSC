-- ============================================================================
--  02b_tables_sin_fk.sql  --  Tablas SIN FOREIGN KEY (máxima compatibilidad TiDB)
--  Target: MySQL 8 / TiDB Cloud
-- ----------------------------------------------------------------------------
--  Versión alternativa de `02_tables.sql`. Se usa cuando el cluster rechaza la
--  sintaxis de FK o cuando se prefiere no depender de ellas (TiDB no las hace
--  cumplir por defecto). La integridad referencial se valida en el backend.
--  Las claves de relación quedan indexadas para no perder performance.
--  Ejecutar 02_tables.sql **o** 02b_tables_sin_fk.sql, nunca ambos.
-- ============================================================================

USE `retenes_stock`;

CREATE TABLE IF NOT EXISTS `roles` (
  `id`          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo`      VARCHAR(32)      NOT NULL,
  `nombre`      VARCHAR(64)      NOT NULL,
  `descripcion` VARCHAR(255)     NULL,
  `creado_en`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `rol_id`           TINYINT UNSIGNED NOT NULL,
  `email`            VARCHAR(190)     NOT NULL,
  `password_hash`    VARCHAR(255)     NULL,
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
  KEY `ix_usuarios_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `proveedores_oauth` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id`        BIGINT UNSIGNED NOT NULL,
  `proveedor`         VARCHAR(20)     NOT NULL,
  `proveedor_user_id` VARCHAR(191)    NOT NULL,
  `email_proveedor`   VARCHAR(190)    NULL,
  `avatar_url`        VARCHAR(512)    NULL,
  `creado_en`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_oauth_proveedor_user` (`proveedor`, `proveedor_user_id`),
  KEY `ix_oauth_usuario` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id`      BIGINT UNSIGNED NOT NULL,
  `token_hash`      CHAR(64)        NOT NULL,
  `reemplazado_por` CHAR(64)        NULL,
  `expira_en`       DATETIME        NOT NULL,
  `revocado`        TINYINT(1)      NOT NULL DEFAULT 0,
  `user_agent`      VARCHAR(255)    NULL,
  `ip`              VARCHAR(45)     NULL,
  `creado_en`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refresh_token_hash` (`token_hash`),
  KEY `ix_refresh_usuario` (`usuario_id`),
  KEY `ix_refresh_expira` (`expira_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `categorias` (
  `id`             SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`         VARCHAR(150)      NOT NULL,
  `slug`           VARCHAR(160)      NOT NULL,
  `orden`          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `activo`         TINYINT(1)        NOT NULL DEFAULT 1,
  `creado_en`      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_nombre` (`nombre`),
  UNIQUE KEY `uk_categorias_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `giro`            VARCHAR(10)       NULL,
  `uxb`             TINYINT UNSIGNED  NULL,
  `observaciones`   TEXT              NULL,
  `precio_lista`    DECIMAL(14,2)     NULL,
  `proximo_ingreso` TINYINT(1)        NOT NULL DEFAULT 0,
  `proximo_embarque` INT              NOT NULL DEFAULT 0,
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
  KEY `ix_productos_creado` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `equivalencias` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id` BIGINT UNSIGNED NOT NULL,
  `tipo`        VARCHAR(8)      NOT NULL,
  `codigo`      VARCHAR(64)     NOT NULL,
  `creado_en`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equiv_producto_tipo_codigo` (`producto_id`, `tipo`, `codigo`),
  KEY `ix_equiv_codigo` (`codigo`),
  KEY `ix_equiv_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `movimientos_stock` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id`      BIGINT UNSIGNED NOT NULL,
  `tipo`             VARCHAR(10)     NOT NULL,
  `cantidad`         INT             NOT NULL,
  `stock_anterior`   INT             NOT NULL,
  `stock_resultante` INT             NOT NULL,
  `motivo`           VARCHAR(255)    NULL,
  `referencia`       VARCHAR(64)     NULL,
  `usuario_id`       BIGINT UNSIGNED NULL,
  `creado_en`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_mov_producto` (`producto_id`),
  KEY `ix_mov_tipo` (`tipo`),
  KEY `ix_mov_usuario` (`usuario_id`),
  KEY `ix_mov_creado` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `historial_precios` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id`     BIGINT UNSIGNED NOT NULL,
  `precio_anterior` DECIMAL(14,2)   NULL,
  `precio_nuevo`    DECIMAL(14,2)   NULL,
  `origen`          VARCHAR(20)     NOT NULL DEFAULT 'importacion',
  `usuario_id`      BIGINT UNSIGNED NULL,
  `creado_en`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_precio_producto` (`producto_id`),
  KEY `ix_precio_creado` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `auditoria` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT UNSIGNED NULL,
  `accion`     VARCHAR(64)     NOT NULL,
  `entidad`    VARCHAR(64)     NOT NULL,
  `entidad_id` VARCHAR(64)     NULL,
  `detalle`    JSON            NULL,
  `ip`         VARCHAR(45)     NULL,
  `creado_en`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_aud_usuario` (`usuario_id`),
  KEY `ix_aud_entidad` (`entidad`, `entidad_id`),
  KEY `ix_aud_creado` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `configuracion` (
  `clave`          VARCHAR(64)  NOT NULL,
  `valor`          TEXT         NULL,
  `descripcion`    VARCHAR(255) NULL,
  `actualizado_en` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
