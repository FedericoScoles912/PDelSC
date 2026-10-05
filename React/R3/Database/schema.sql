-- ================================================================
--  DATABASE SCHEMA (MySQL 8.0+)
--  Proyecto: user-auth-system
--  Compatible con MySQL Workbench 8.0
-- ================================================================

CREATE DATABASE IF NOT EXISTS `auth_system`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `auth_system`;

-- Eliminar tabla previa si existe
DROP TABLE IF EXISTS `users`;

-- Tabla principal de usuarios
CREATE TABLE `users` (
  `id`              CHAR(36)        NOT NULL PRIMARY KEY,
  `name`            VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL,
  `password`        VARCHAR(255)    NOT NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
