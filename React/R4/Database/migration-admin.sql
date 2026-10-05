-- Migración no destructiva MySQL 8+ para habilitar /admin.
-- Ejecutar: mysql -u root -p portfolio_db < Database/migration-admin.sql
CREATE TABLE IF NOT EXISTS profile (
  id TINYINT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  tagline TEXT NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(80), city VARCHAR(200), github_url VARCHAR(500), linkedin_url VARCHAR(500), profile_image_url VARCHAR(500),
  about_paragraphs JSON NOT NULL, languages JSON NOT NULL, hobbies JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT IGNORE INTO profile (id, full_name, role, tagline, email, phone, city, github_url, linkedin_url, about_paragraphs, languages, hobbies) VALUES
(1, 'Federico Scoles', 'Programador en desarrollo', 'Estudiante de informática interesado en Inteligencia Artificial, Machine Learning y desarrollo Front End.', 'fedescoles2007@gmail.com', '+54 223 581-1876', 'Mar del Plata, Argentina', 'https://github.com/FedericoScoles912', 'https://www.linkedin.com/in/federico-scoles-584a50378/', JSON_ARRAY('Soy Federico Scoles, un programador en desarrollo.'), JSON_ARRAY('Español (nativo)', 'Inglés (C1+)'), JSON_ARRAY('Gimnasio', 'Música', 'Running'));
