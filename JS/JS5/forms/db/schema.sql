-- Crear base de datos
CREATE DATABASE IF NOT EXISTS alumnosDB;
USE alumnosDB;

-- Crear tabla alumnos
CREATE TABLE IF NOT EXISTS alumnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  edad INT NOT NULL CHECK (edad >= 1 AND edad <= 120)
);
