-- =============================================
-- Datos de prueba (seed) para Portfolio Personal
-- =============================================

-- =============================================
-- Insertar 5 habilidades (skills)
-- Categorías: Frontend, Backend, Tools
-- =============================================
INSERT INTO skills (name, level, category, icon_name) VALUES
    ('Skill 1: React', 90, 'Frontend', 'react-icon'),
    ('Skill 2: Node.js', 85, 'Backend', 'nodejs-icon'),
    ('Skill 3: TypeScript', 80, 'Frontend', 'typescript-icon'),
    ('Skill 4: PostgreSQL', 75, 'Backend', 'postgres-icon'),
    ('Skill 5: Git', 88, 'Tools', 'git-icon');

-- =============================================
-- Insertar 4 proyectos (projects)
-- Uno destacado (featured = true)
-- =============================================
INSERT INTO projects (title, description, repo_url, demo_url, image_url, tags, featured) VALUES
    (
        'Tu proyecto 1: E-Commerce',
        'Descripción placeholder para Tu proyecto 1: Plataforma de comercio electrónico con carrito de compras, autenticación de usuarios y panel de administración.',
        'https://github.com/tuusuario/proyecto1',
        'https://proyecto1.demo.com',
        'https://placehold.co/600x400/png?text=Proyecto+1',
        ARRAY['React', 'Node.js', 'MongoDB', 'Stripe']::TEXT[],
        TRUE
    ),
    (
        'Tu proyecto 2: Gestor de Tareas',
        'Descripción placeholder para Tu proyecto 2: Aplicación de gestión de tareas con drag-and-drop, etiquetas y colaboración en equipo.',
        'https://github.com/tuusuario/proyecto2',
        'https://proyecto2.demo.com',
        'https://placehold.co/600x400/png?text=Proyecto+2',
        ARRAY['Vue.js', 'Firebase', 'Tailwind']::TEXT[],
        FALSE
    ),
    (
        'Tu proyecto 3: Blog Personal',
        'Descripción placeholder para Tu proyecto 3: Blog personal con sistema de artículos, comentarios y panel de administrador.',
        'https://github.com/tuusuario/proyecto3',
        'https://proyecto3.demo.com',
        'https://placehold.co/600x400/png?text=Proyecto+3',
        ARRAY['Next.js', 'PostgreSQL', 'Prisma']::TEXT[],
        FALSE
    ),
    (
        'Tu proyecto 4: Dashboard Analytics',
        'Descripción placeholder para Tu proyecto 4: Panel de análisis con gráficos interactivos, métricas en tiempo real y exportación de reportes.',
        'https://github.com/tuusuario/proyecto4',
        'https://proyecto4.demo.com',
        'https://placehold.co/600x400/png?text=Proyecto+4',
        ARRAY['React', 'D3.js', 'Express', 'Chart.js']::TEXT[],
        FALSE
    );

-- =============================================
-- Insertar 3 experiencias laborales (experiences)
-- =============================================
INSERT INTO experiences (company, role, start_date, end_date, location, description) VALUES
    (
        'Empresa 1: Tech Solutions S.A.',
        'Desarrollador Full Stack Senior',
        '2023-01-15',
        NULL,
        'Buenos Aires, Argentina',
        'Descripción placeholder Empresa 1: Liderazgo técnico en proyectos de desarrollo web, arquitectura de microservicios y mentoría a desarrolladores junior.'
    ),
    (
        'Empresa 2: Digital Agency',
        'Desarrollador Frontend',
        '2021-03-01',
        '2022-12-31',
        'Remoto',
        'Descripción placeholder Empresa 2: Desarrollo de interfaces modernas con React, integración con APIs REST y optimización de rendimiento web.'
    ),
    (
        'Empresa 3: Startup Innovadora',
        'Desarrollador Web Junior',
        '2019-06-10',
        '2021-02-28',
        'Córdoba, Argentina',
        'Descripción placeholder Empresa 3: Desarrollo de sitios web responsivos, mantenimiento de aplicaciones existentes y colaboración en equipo ágil.'
    );

-- =============================================
-- Insertar 3 certificaciones/logros (achievements)
-- =============================================
INSERT INTO achievements (title, issuer, date_earned, description, certificate_url) VALUES
    (
        'Certificación 1: AWS Certified Developer',
        'Amazon Web Services',
        '2024-05-20',
        'Descripción placeholder Certificación 1: Certificación profesional en desarrollo de aplicaciones en la nube de AWS.',
        'https://certificaciones.example.com/cert1'
    ),
    (
        'Certificación 2: Meta Front-End Developer',
        'Meta / Coursera',
        '2023-11-10',
        'Descripción placeholder Certificación 2: Programa especializado en desarrollo frontend moderno con React y herramientas del ecosistema Meta.',
        'https://certificaciones.example.com/cert2'
    ),
    (
        'Certificación 3: Scrum Master Certified',
        'Scrum Alliance',
        '2022-08-15',
        'Descripción placeholder Certificación 3: Certificación en metodologías ágiles y gestión de proyectos Scrum.',
        'https://certificaciones.example.com/cert3'
    );
