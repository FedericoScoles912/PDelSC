-- Esquema MySQL 8+ para el portfolio.
-- ATENCIÓN: elimina las tablas actuales de ESTA base MySQL.
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS skills;

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level TINYINT UNSIGNED NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  icon_name VARCHAR(100),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_skills_level CHECK (level BETWEEN 0 AND 100),
  INDEX idx_skills_category (category)
);

CREATE TABLE profile (
  id TINYINT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  tagline TEXT NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(80),
  city VARCHAR(200),
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  profile_image_url VARCHAR(500),
  about_paragraphs JSON NOT NULL,
  languages JSON NOT NULL,
  hobbies JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_profile_id CHECK (id = 1)
);

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  repo_url VARCHAR(500),
  demo_url VARCHAR(500),
  image_url VARCHAR(500),
  tags JSON NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_projects_featured (featured)
);

CREATE TABLE experiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  location VARCHAR(200),
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_experiences_start_date (start_date)
);

CREATE TABLE achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  issuer VARCHAR(200) NOT NULL,
  date_earned DATE NOT NULL,
  description TEXT,
  certificate_url VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_achievements_date_earned (date_earned)
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_read (`read`)
);
