-- ============================================================================
--  02_tables.sql
--  Definición de tablas del Sistema de Control de Stock (Retenes EMIC).
--  Motor InnoDB (transacciones + FKs). Codificación utf8mb4.
-- ============================================================================

USE retenes_stock;

-- ---------------------------------------------------------------------------
-- Roles y usuarios
-- ---------------------------------------------------------------------------
CREATE TABLE roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50)  NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  permisos    JSON         NULL,          -- lista de permisos otorgados al rol
  creado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(80)  NOT NULL,
  apellido         VARCHAR(80)  NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NULL,     -- NULL si el usuario solo usa login social
  rol_id           INT          NOT NULL,
  activo           TINYINT(1)   NOT NULL DEFAULT 1,
  email_verificado TINYINT(1)   NOT NULL DEFAULT 0,
  ultimo_login     DATETIME     NULL,
  creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Identidades de proveedores sociales (1 usuario puede tener N proveedores)
CREATE TABLE proveedores_oauth (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT          NOT NULL,
  proveedor        ENUM('google','facebook','github') NOT NULL,
  provider_user_id VARCHAR(191) NOT NULL,
  email_proveedor  VARCHAR(150) NULL,
  creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oauth_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT uq_oauth_proveedor UNIQUE (proveedor, provider_user_id)
) ENGINE=InnoDB;

-- Refresh tokens (rotación y revocación)
CREATE TABLE refresh_tokens (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id         INT         NOT NULL,
  token_hash         CHAR(64)    NOT NULL UNIQUE,  -- sha256(token)
  expira_en          DATETIME    NOT NULL,
  revocado           TINYINT(1)  NOT NULL DEFAULT 0,
  reemplazado_por_id INT         NULL,             -- encadenado de rotación
  ip                 VARCHAR(45) NULL,
  user_agent         VARCHAR(255) NULL,
  creado_en          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
CREATE TABLE categorias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL UNIQUE,
  slug        VARCHAR(140) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  orden       INT          NOT NULL DEFAULT 0,
  activo      TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE productos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  codigo           VARCHAR(40)  NOT NULL UNIQUE,
  categoria_id     INT          NULL,
  lanzamiento      VARCHAR(80)  NULL,   -- "LANZAMIENTO", "IDEM: 4015300", etc.

  -- Medidas: se guarda el texto original y el valor numérico cuando existe
  eje_texto        VARCHAR(40)  NULL,
  eje_valor        DECIMAL(10,2) NULL,
  aloj_texto       VARCHAR(40)  NULL,
  aloj_valor       DECIMAL(10,2) NULL,
  alt_texto        VARCHAR(40)  NULL,
  alt_valor        DECIMAL(10,2) NULL,

  giro             VARCHAR(16)  NULL,   -- H, AH, LI, LISO, BI DIR
  uxb              INT          NULL,   -- unidades por bolsa/caja
  observaciones    TEXT         NULL,   -- aplicación: marca/modelo/motor

  precio_lista     DECIMAL(12,2) NULL,  -- NULL si "PRÓXIMO INGRESO"
  proximo_ingreso  TINYINT(1)   NOT NULL DEFAULT 0,
  stock_minimo     INT          NOT NULL DEFAULT 0,
  activo           TINYINT(1)   NOT NULL DEFAULT 1,

  creado_en        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Equivalencias OEM / A / S (relación 1-N con productos)
CREATE TABLE equivalencias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT          NOT NULL,
  tipo        ENUM('OEM','A','S') NOT NULL,
  codigo      VARCHAR(64)  NOT NULL,
  creado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_equiv_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT uq_equiv UNIQUE (producto_id, tipo, codigo)
) ENGINE=InnoDB;

-- Stock actual (1 fila por producto; se actualiza dentro de transacciones)
CREATE TABLE stock (
  producto_id    INT NOT NULL PRIMARY KEY,
  cantidad       INT NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Movimientos de stock (ingresos, egresos, ajustes) - trazabilidad completa
CREATE TABLE movimientos_stock (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  producto_id    INT          NOT NULL,
  tipo           ENUM('INGRESO','EGRESO','AJUSTE') NOT NULL,
  cantidad       INT          NOT NULL,        -- siempre positiva (el signo lo da el tipo)
  stock_anterior INT          NOT NULL,
  stock_nuevo    INT          NOT NULL,
  motivo         VARCHAR(255) NULL,
  referencia     VARCHAR(64)  NULL,            -- nro de remito / venta / orden
  usuario_id     INT          NULL,
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mov_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Historial de cambios de precio
CREATE TABLE historial_precios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  producto_id    INT          NOT NULL,
  precio_anterior DECIMAL(12,2) NULL,
  precio_nuevo   DECIMAL(12,2) NULL,
  origen         ENUM('MANUAL','IMPORTACION') NOT NULL DEFAULT 'MANUAL',
  usuario_id     INT          NULL,
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_hist_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Alertas de stock mínimo (registro de disparos para auditoría/notificaciones)
CREATE TABLE alertas_stock (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT          NOT NULL,
  stock_valor INT          NOT NULL,
  minimo      INT          NOT NULL,
  resuelta    TINYINT(1)   NOT NULL DEFAULT 0,
  creado_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resuelta_en DATETIME     NULL,
  CONSTRAINT fk_alerta_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Auditoría (quién hizo qué y cuándo)
CREATE TABLE auditoria (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT          NULL,
  accion        VARCHAR(80)  NOT NULL,   -- CREAR, ACTUALIZAR, ELIMINAR, LOGIN, ...
  entidad       VARCHAR(60)  NOT NULL,   -- producto, usuario, movimiento, ...
  entidad_id    INT          NULL,
  datos_antes   JSON         NULL,
  datos_despues JSON         NULL,
  ip            VARCHAR(45)  NULL,
  creado_en     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aud_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Configuración general (clave-valor)
CREATE TABLE configuracion (
  clave         VARCHAR(60)  PRIMARY KEY,
  valor         TEXT         NULL,
  descripcion   VARCHAR(255) NULL,
  actualizado_en TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
