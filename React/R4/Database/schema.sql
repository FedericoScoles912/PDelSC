-- =============================================
-- Esquema de base de datos para Portfolio Personal
-- =============================================

-- Eliminar tablas si existen (para reinicios limpios)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS skills CASCADE;

-- =============================================
-- Tabla: skills
-- Habilidades técnicas y blandas del portfolio
-- =============================================
CREATE TABLE skills (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    level       INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 100),
    category    VARCHAR(50) NOT NULL,
    icon_name   VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por categoría
CREATE INDEX idx_skills_category ON skills(category);

-- =============================================
-- Tabla: projects
-- Proyectos destacados del portfolio
-- =============================================
CREATE TABLE projects (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    repo_url    VARCHAR(500),
    demo_url    VARCHAR(500),
    image_url   VARCHAR(500),
    tags        TEXT[] NOT NULL DEFAULT '{}',
    featured    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para proyectos destacados
CREATE INDEX idx_projects_featured ON projects(featured);

-- =============================================
-- Tabla: experiences
-- Experiencia laboral
-- =============================================
CREATE TABLE experiences (
    id          SERIAL PRIMARY KEY,
    company     VARCHAR(200) NOT NULL,
    role        VARCHAR(200) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE,
    location    VARCHAR(200),
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para ordenar por fecha de inicio
CREATE INDEX idx_experiences_start_date ON experiences(start_date DESC);

-- =============================================
-- Tabla: achievements
-- Certificaciones y logros
-- =============================================
CREATE TABLE achievements (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    issuer          VARCHAR(200) NOT NULL,
    date_earned     DATE NOT NULL,
    description     TEXT,
    certificate_url VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para ordenar por fecha obtenida
CREATE INDEX idx_achievements_date_earned ON achievements(date_earned DESC);

-- =============================================
-- Tabla: messages
-- Mensajes recibidos del formulario de contacto
-- =============================================
CREATE TABLE messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para mensajes no leídos
CREATE INDEX idx_messages_read ON messages(read);
