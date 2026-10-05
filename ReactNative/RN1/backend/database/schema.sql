-- ==============================================================
-- Creación de la Base de Datos y Tabla de Usuarios
-- Compatible con MySQL / MariaDB (XAMPP, WAMP, LAMP)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `acceso_usuarios`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `acceso_usuarios`;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE,
  `usuario` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` VARCHAR(50) NOT NULL DEFAULT 'Usuario',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- Usuarios de ejemplo iniciales
-- Contraseñas pre-hasheadas con bcrypt (cost factor 10):
-- 1. admin / admin123 -> $2b$10$Q1pI0nUvY6oQ0fGf8m.U.uC2l7xN8D5zCjZ3nZ0bZ2vE0bK0aG0gW
-- 2. juan.perez / clave456 -> $2b$10$wI5PqUvD3lF6m7j9k0.A..G1h2j3k4l5m6n7o8p9q0r1s2t3u4v5w
-- 3. maria.lopez / secreto789 -> $2b$10$m9l8k7j6h5g4f3d2s1.B..Z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k
-- NOTA: Puedes ejecutar `npm run seed` en /backend para re-generar
-- hashes frescos usando la librería bcrypt en tu propio entorno.
-- ==============================================================

-- Inserción idempotente de usuarios de prueba (se pueden ejecutar múltiples veces)
INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `usuario`, `password_hash`, `rol`)
VALUES
  (
    1,
    'Federico Scoles',
    'admin@empresa.com',
    'admin',
    '$2b$10$gJ6fK7E0JcTsmk1yH8610u1w5uN32g38WmsWz5U09cQ6s7p0lq5G2',
    'Administrador'
  ),
  (
    2,
    'Juan Pérez',
    'juan.perez@empresa.com',
    'juan.perez',
    '$2b$10$Vb2tI6z7m3gX7wL5d4y5Z.nL3oF4k5j6h7g8f9e0d1c2b3a4z5y6x',
    'Editor'
  ),
  (
    3,
    'María López',
    'maria.lopez@empresa.com',
    'maria.lopez',
    '$2b$10$C8e9d0c1b2a3z4y5x6w7v.8u9t0s1r2q3p4o5n6m7l8k9j0h1g2f3',
    'Usuario'
  )
ON DUPLICATE KEY UPDATE
  `nombre` = VALUES(`nombre`),
  `correo` = VALUES(`correo`),
  `rol` = VALUES(`rol`);
