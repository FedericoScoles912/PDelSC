-- ======================================================
--  SCRIPT DE BASE DE DATOS — El Ahorcado: Palabras al Límite
--  Base: MySQL 8.0+ | Codificación: utf8mb4
--  Ejecutar directamente desde cero con un usuario con privilegios.
-- ======================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS Score
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Score;

-- ======================================================
--  TABLA: score
--  Almacena los resultados de cada partida ganada.
-- ======================================================
CREATE TABLE IF NOT EXISTS score (
  id        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(60)     NOT NULL,
  puntos    INT             NOT NULL DEFAULT 0,
  tiempo    INT UNSIGNED    NOT NULL COMMENT 'Tiempo en segundos que tardó en ganar',
  fecha     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_puntos (puntos DESC),
  INDEX idx_fecha  (fecha   DESC)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ======================================================
--  SEED DATA — Registros de ejemplo
--  5 registros para que la tabla de posiciones no aparezca vacía.
-- ======================================================
INSERT INTO score (nombre, puntos, tiempo, fecha) VALUES
  ('María López',    150, 28, '2025-08-01 14:22:10'),
  ('Carlos Ruiz',    135, 47, '2025-08-02 09:15:33'),
  ('Ana Martínez',   110, 72, '2025-08-02 18:40:02'),
  ('Jorge Fernández',100, 135,'2025-08-03 20:10:45'),
  ('Lucía Gómez',    125, 55, '2025-08-04 11:03:19');
