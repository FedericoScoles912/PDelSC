-- ============================================================================
--  01_schema.sql
--  Sistema de Control de Stock - Retenes EMIC
--  Crea la base de datos y establece el contexto.
--  Ejecutar en MySQL Workbench en este orden: 01, 02, 03, 04, 05, 06.
-- ============================================================================

DROP DATABASE IF EXISTS retenes_stock;

CREATE DATABASE retenes_stock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE retenes_stock;

-- Zona horaria de la sesión (Argentina). Ajustar si el servidor difiere.
SET time_zone = '-03:00';
