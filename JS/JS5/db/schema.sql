-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS alumnosDB;

-- Usar la base de datos recién creada
USE alumnosDB;

-- Crear la tabla alumnos con sus campos y restricciones
CREATE TABLE IF NOT EXISTS alumnos (
  -- Campo id: identificador único autoincremental (clave primaria)
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Campo nombre: texto obligatorio con máximo 100 caracteres
  nombre VARCHAR(100) NOT NULL,
  
  -- Campo apellido: texto obligatorio con máximo 100 caracteres
  apellido VARCHAR(100) NOT NULL,
  
  -- Campo edad: número entero obligatorio con restricción entre 1 y 120
  edad INT NOT NULL CHECK (edad >= 1 AND edad <= 120)
);
