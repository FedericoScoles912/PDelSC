# Portfolio Personal - React + Tailwind + SQL

Portfolio personal full-stack: frontend en React (Vite) con estilos en Tailwind CSS + Bootstrap Grid, animaciones con Framer Motion, backend en Express y base de datos relacional en PostgreSQL. Incluye secciones de Hero, Sobre mí, Skills, Proyectos, Experiencia, Certificaciones y Formulario de contacto funcional.

> **Repositorio:** LINK_REPOSITORIO_GIT
> **Despliegue en producción:** LINK_DESPLIEGUE_PRODUCCION

---

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18 (Hooks, Context API), Vite 5, ESM nativo |
| **Estilos** | Tailwind CSS 3 (utility-first) + Bootstrap 5 (solo sistema de grid) |
| **Animaciones** | Framer Motion 11 (stagger, viewport triggers, springs) |
| **Backend** | Node.js >= 18, Express 4, CORS, dotenv |
| **Base de datos** | PostgreSQL 14+, node-postgres (`pg`) |
| **Formato módulos** | ESM en todo el proyecto (`"type": "module"`) |

---

## Tabla de Contenidos

1. [Instrucciones Rápidas](#instrucciones-rápidas)
2. [Documentación Detallada](#documentación-detallada)
3. [Estructura de Carpetas (resumen)](#estructura-de-carpetas-resumen)
4. [Esquema de Base de Datos (resumen)](#esquema-de-base-de-datos-resumen)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Endpoints de la API](#endpoints-de-la-api)
7. [Estado del Proyecto](#estado-del-proyecto)

---

## Instrucciones Rápidas

> Si preferís la guía **paso a paso completa**, lee [Docs/02-instalacion-local.md](Docs/02-instalacion-local.md). Lo que sigue es un TL;DR.

**Prerrequisitos:** tener Node.js >= 18 y PostgreSQL >= 14 instalados.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env          # Linux/Mac
# Copy-Item .env.example .env # Windows PowerShell
# -> Editá .env con tus credenciales de PostgreSQL

# 3. Crear la base de datos
psql -U postgres -c "CREATE DATABASE portfolio_db;"

# 4. Ejecutar esquema + datos iniciales
psql -U postgres -d portfolio_db -f Database/schema.sql
psql -U postgres -d portfolio_db -f Database/seed.sql

# 5. Levantar el entorno de desarrollo (dos terminales)
#    Terminal 1 (Vite):
npm run dev                   # http://localhost:5173
#    Terminal 2 (Express):
npm run server:dev            # http://localhost:3001
```

Abrí `http://localhost:5173` en el navegador.

---

## Documentación Detallada

Toda la guía extendida vive en la carpeta [Docs/](Docs/):

| Documento | Link | Qué contiene |
|-----------|------|--------------|
| Estructura de carpetas | [Docs/01-estructura-carpetas.md](Docs/01-estructura-carpetas.md) | Descripción de cada carpeta (`Scripts`, `Components`, `Styles`, `Assets`, `Database`, `Routes`, `Docs`) y archivos raíz (`server.js`, `package.json`) con su responsabilidad. |
| Instalación local | [Docs/02-instalacion-local.md](Docs/02-instalacion-local.md) | Prerrequisitos, `npm install`, `.env`, creación de BD, carga de `schema.sql` + `seed.sql`, modo dev (2 terminales) y modo producción. |
| Esquema de BD | [Docs/03-esquema-bd.md](Docs/03-esquema-bd.md) | Detalle de las 5 tablas (`skills`, `projects`, `experiences`, `achievements`, `messages`): columnas, tipos, constraints, PKs, índices y diagrama textual (desnormalizado, sin FK por ahora). |
| Decisiones técnicas | [Docs/04-decisiones-tecnicas.md](Docs/04-decisiones-tecnicas.md) | Justificación del stack: PostgreSQL vs MySQL, Vite vs CRA, Framer Motion vs CSS puro, Bootstrap solo grid + Tailwind, ESM everywhere y tema otoñal. |
| Despliegue | [Docs/05-despliegue.md](Docs/05-despliegue.md) | Opción A (Render monolítico: build `npm install && npm run build`, start `npm start`, vars de entorno) y Opción B (Vercel frontend + Railway backend/PostgreSQL con `VITE_API_BASE_URL`). |

---

## Estructura de Carpetas (resumen)

```
R4/
├── server.js                # Servidor Express: sirve dist/ + monta /api/*
├── package.json             # Dependencias, scripts, engines, type: module
├── .env.example             # Plantilla de variables de entorno
├── vite.config.js           # Configuración Vite + plugin React
├── tailwind.config.js       # Colores del tema otoñal + content paths
├── index.html               # HTML raíz de Vite
├── Scripts/                 # main.jsx, hooks (useApiData, useScrollSpy),
│                            #   contexts (Tema, Notificaciones), apiClient, utils
├── Components/              # Portfolio, Navbar, HeroSection, AboutMe,
│                            #   SkillsSection, ProjectsGallery, ExperienceTimeline,
│                            #   AchievementsSection, ContactForm, Footer + atoms
├── Styles/                  # index.css (Tailwind + Bootstrap grid + globals)
│                            # theme.css (variables CSS del tema)
├── Assets/                  # Imágenes, SVG, favicon, fuentes locales
├── Database/
│   ├── connection.js        # Pool de conexiones pg con variables .env
│   ├── schema.sql           # DDL: 5 tablas + índices
│   └── seed.sql             # Datos iniciales de ejemplo
├── Routes/                  # Express Routers por recurso
│   ├── skills.js            #   GET /api/skills
│   ├── projects.js          #   GET /api/projects
│   ├── experiences.js       #   GET /api/experiences
│   ├── achievements.js      #   GET /api/achievements
│   └── messages.js          #   POST /api/messages
├── Docs/                    # Este y otros documentos de la tabla anterior
└── dist/                    # Build compilado de Vite (gitignoreado)
```

Descripción completa y responsabilidad por archivo: [Docs/01-estructura-carpetas.md](Docs/01-estructura-carpetas.md).

---

## Esquema de Base de Datos (resumen)

Diseño **desnormalizado**: 5 tablas independientes, sin FKs explícitos en esta etapa. Motor: **PostgreSQL**.

```
skills          projects        experiences     achievements    messages
──────────────  ──────────────  ──────────────  ──────────────  ──────────────
id (PK)         id (PK)         id (PK)         id (PK)         id (PK)
name            title           company         title           name
level           description     role            issuer          email
category        repo_url        start_date      date_earned     body
icon_name       demo_url        end_date        description     read
created_at      image_url       location        certificate_url created_at
                tags            description     created_at
                featured        created_at
                created_at
```

Detalle de tipos, constraints, índices y diagrama textual: [Docs/03-esquema-bd.md](Docs/03-esquema-bd.md).

---

## Scripts Disponibles

Definidos en `package.json`:

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Levanta Vite en modo desarrollo (puerto 5173, HMR). |
| `npm run build` | Compila el frontend al directorio `dist/`. |
| `npm run preview` | Sirve `dist/` localmente con Vite para revisar el build. |
| `npm run server:dev` | Levanta Express con `--watch` (auto-restart al editar). |
| `npm start` | Levanta Express en modo producción (sirve `dist/` + API). |

---

## Endpoints de la API

Base URL:
- **Desarrollo:** `http://localhost:3001/api`
- **Producción monolítica (Render):** `/api` (relativa al mismo dominio)
- **Producción separada (Railway):** `https://TU_BACKEND/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/skills` | Habilidades, filtro opcional `?category=Frontend` |
| `GET` | `/api/projects` | Proyectos, filtro opcional `?featured=true` |
| `GET` | `/api/projects/:id` | Proyecto por ID |
| `GET` | `/api/experiences` | Experiencia laboral (`ORDER BY start_date DESC`) |
| `GET` | `/api/achievements` | Certificaciones/logros (`ORDER BY date_earned DESC`) |
| `POST` | `/api/messages` | Crea un mensaje del formulario de contacto (`body: { name, email, body }`) |
| `GET` | `/api/messages` | Lista mensajes recibidos (futuro panel admin) |

---

## Estado del Proyecto

| Hito | Estado |
|------|--------|
| Estructura de carpetas y scaffolding | ✅ Listo |
| Esquema BD + seed inicial | ✅ Listo |
| API Express (5 recursos) | ✅ Listo |
| Componentes principales (Hero, About, Skills, Projects, Experience, Achievements, Contact, Footer) | ✅ Listo |
| Estilos (Tailwind + Bootstrap grid, tema otoñal) | ✅ Listo |
| Animaciones Framer Motion | ✅ Listo |
| Formulario de contacto con notificaciones | ✅ Listo |
| Hooks personalizados (useApiData, useScrollSpy) | ✅ Listo |
| Documentación (Docs/ 1–5 + README) | ✅ Listo |
| Pruebas locales de build y servidor | Pendiente |
| Despliegue a Render / Vercel+Railway | Pendiente |
| Placeholders: `LINK_REPOSITORIO_GIT`, `LINK_DESPLIEGUE_PRODUCCION` | ⚠️ Reemplazar cuando estén disponibles |
