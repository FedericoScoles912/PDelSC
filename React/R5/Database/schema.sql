-- =====================================================================
-- user-auth-system - Esquema de base de datos (MySQL 8+)
-- Uso:
--   mysql -u root -p < Database/schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS user_auth_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE user_auth_system;

-- ---------------------------------------------------------------------
-- users
--   password es NULLABLE: un usuario creado 100% via OAuth puede no
--   tener contrasena local.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NULL,
  avatar_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- social_accounts (1 usuario : N cuentas sociales)
--   ON DELETE CASCADE: al borrar el usuario se borran sus vinculos.
--   UNIQUE (provider, provider_user_id): una cuenta externa solo puede
--   estar vinculada a un unico usuario local.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_accounts (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  provider         ENUM(
                     'google','facebook','github','x',
                     'discord','twitch','microsoft','linkedin'
                   ) NOT NULL,
  provider_user_id VARCHAR(191) NOT NULL,
  provider_email   VARCHAR(255) NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_social_accounts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT uq_provider_account
    UNIQUE (provider, provider_user_id),
  INDEX idx_social_accounts_user (user_id)
) ENGINE = InnoDB;
