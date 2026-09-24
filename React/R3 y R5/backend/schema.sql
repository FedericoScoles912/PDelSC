-- ================================================================
--  SCHEMA AUTENTICACIÓN DUAL (MySQL 8.0+)
--  Motor elegido: MySQL
--  Convenciones:
--   * UUIDs como CHAR(36) (compatibles UUID v4)
--   * Prepared statements desde mysql2/promise previenen SQL injection
--   * Campos JSON para datos dinámicos de OAuth
-- ================================================================

CREATE DATABASE IF NOT EXISTS `auth_system`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `auth_system`;

-- ================================================================
--  TABLA: users
-- ================================================================
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `oauth_accounts`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id`              CHAR(36)        NOT NULL PRIMARY KEY,
  `email`           VARCHAR(255)    NOT NULL,
  `username`        VARCHAR(50)     DEFAULT NULL,
  `password_hash`   VARCHAR(255)    DEFAULT NULL,
  `display_name`    VARCHAR(100)    NOT NULL,
  `avatar_url`      TEXT            DEFAULT NULL,
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_users_email`        (`email`),
  UNIQUE KEY `uk_users_username`     (`username`),
  KEY `idx_users_email_active`       (`email`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
--  TABLA: oauth_accounts
--  Relación 1:N con users (un usuario puede enlazar múltiples cuentas sociales)
-- ================================================================
CREATE TABLE `oauth_accounts` (
  `id`                CHAR(36)      NOT NULL PRIMARY KEY,
  `user_id`           CHAR(36)      NOT NULL,
  `provider`          VARCHAR(32)   NOT NULL,
  `provider_user_id`  VARCHAR(255)  NOT NULL,
  `access_token`      TEXT          DEFAULT NULL,
  `refresh_token`     TEXT          DEFAULT NULL,
  `expires_at`        DATETIME      DEFAULT NULL,
  `profile_data`      JSON          DEFAULT NULL,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_oauth_provider_user` (`provider`, `provider_user_id`),
  KEY `idx_oauth_user_id`             (`user_id`),

  CONSTRAINT `fk_oauth_accounts_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
--  TABLA: refresh_tokens
--  Rotación y revocación server-side de refresh tokens.
--  Los valores se almacenan HASHEADOS (SHA-256).
-- ================================================================
CREATE TABLE `refresh_tokens` (
  `id`            CHAR(36)      NOT NULL PRIMARY KEY,
  `user_id`       CHAR(36)      NOT NULL,
  `token_hash`    VARCHAR(64)   NOT NULL,
  `user_agent`    TEXT          DEFAULT NULL,
  `ip_address`    VARCHAR(45)   DEFAULT NULL,
  `expires_at`    DATETIME      NOT NULL,
  `is_revoked`    TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_refresh_token_hash`   (`token_hash`),
  KEY `idx_refresh_user_revoked`       (`user_id`, `is_revoked`),
  KEY `idx_refresh_expires`            (`expires_at`),

  CONSTRAINT `fk_refresh_tokens_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
--  TRIGGER: generar UUID v4 para PKs si no se envía explícitamente
-- ================================================================
DELIMITER //

CREATE TRIGGER `tr_users_before_insert`
BEFORE INSERT ON `users`
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

CREATE TRIGGER `tr_oauth_accounts_before_insert`
BEFORE INSERT ON `oauth_accounts`
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

CREATE TRIGGER `tr_refresh_tokens_before_insert`
BEFORE INSERT ON `refresh_tokens`
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DELIMITER ;
