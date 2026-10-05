# Portfolio Personal - React + Tailwind + SQL

Portfolio personal full-stack: frontend en React (Vite), backend Express y base de datos MySQL. Incluye un portfolio público y un panel de administración para gestionar su contenido.

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
| **Base de datos** | MySQL 8+, `mysql2` |
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

## Ejecutar con MySQL

Este proyecto usa **MySQL** mediante `mysql2`. No requiere PostgreSQL, Turso ni SQLite.

### 1. Requisitos

- Node.js 18 o superior.
- MySQL 8 o superior, con el servicio en ejecución.

Comprobá que la consola de MySQL esté disponible:

```powershell
mysql --version
```

### 2. Instalar y configurar

Desde PowerShell, en la carpeta del proyecto:

```powershell
npm install
Copy-Item .env.example .env
```

Editá `.env` con las credenciales de tu instalación local:

```dotenv
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio_db
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Crear e inicializar la base de datos

```powershell
mysql -u root -p -e "CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p portfolio_db < Database/schema.sql
mysql -u root -p portfolio_db < Database/seed.sql
```

> `schema.sql` elimina y vuelve a crear las tablas. No lo ejecutes sobre una base de datos con información que quieras conservar.

Si tu usuario no es `root`, reemplazalo en los comandos y en `.env`.

### 4. Iniciar el proyecto

Abrí dos terminales en la raíz del proyecto:

```powershell
# Terminal 1: API Express + MySQL
npm run server:dev

# Terminal 2: frontend Vite
npm run dev
```

Abrí [http://localhost:5179](http://localhost:5179). Vite redirige las solicitudes `/api` al servidor Express en `http://localhost:3001`.

### Panel de administración

El panel está disponible en [http://localhost:5179/admin](http://localhost:5179/admin). Permite editar el perfil, tecnologías, proyectos, experiencia y certificaciones; cada cambio se guarda en MySQL.

En desarrollo, si todavía no definiste las variables de administrador, podés ingresar con:

```text
Usuario: admin
Contraseña: admin123
```

Antes de publicar, reemplazá esas credenciales creando valores propios en `.env` y en las variables de entorno de Vercel.

1. En `.env`, definí valores seguros para `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`.
2. Si ya tenías una base creada, aplicá la migración no destructiva:

```powershell
mysql -u root -p portfolio_db < Database/migration-admin.sql
```

3. Reiniciá `npm run server:dev` e ingresá a `/admin` con las credenciales configuradas.

> Para reemplazar también los antiguos datos de ejemplo por el contenido actual del portfolio, ejecutá de nuevo `schema.sql` y `seed.sql`. Este reinicio elimina los registros existentes; después podrás gestionarlos desde `/admin`.

## Publicar en Vercel + MySQL

Vercel ejecuta el frontend y las rutas `/api`; MySQL debe ser una base gestionada accesible desde Internet (por ejemplo, PlanetScale, Railway, Aiven o DigitalOcean). No expongas una base MySQL local.

1. Subí el repositorio a GitHub y creá una base MySQL gestionada. Copiá su cadena de conexión `mysql://...`.
2. Desde tu computadora, cargá el esquema y los datos iniciales en esa base. En PowerShell:

```powershell
mysql -h TU_HOST -P 3306 -u TU_USUARIO -p TU_BASE < Database/schema.sql
mysql -h TU_HOST -P 3306 -u TU_USUARIO -p TU_BASE < Database/seed.sql
```

3. En [Vercel](https://vercel.com/new), importá el repositorio. Detectará Vite; conservá `npm run build` como Build Command y `dist` como Output Directory.
4. En **Settings → Environment Variables**, agregá para Production (y Preview si lo necesitás):

```text
DATABASE_URL=mysql://usuario:contraseña@host:3306/portfolio_db
ADMIN_USERNAME=tu_usuario_unico
ADMIN_PASSWORD=una_contraseña_larga_y_unica
ADMIN_SESSION_SECRET=un_secreto_aleatorio_largo
NODE_ENV=production
```

5. Hacé **Deploy**. Abrí tu dominio de Vercel y luego `https://tu-dominio.vercel.app/admin`.

El archivo `vercel.json` ya dirige `/api/*` a la función serverless de Express y `/admin` a la aplicación React.

---

## Documentación Detallada

Toda la guía extendida vive en la carpeta [Docs/](Docs/):

| Documento | Link | Qué contiene |
|-----------|------|--------------|
| Estructura de carpetas | [Docs/01-estructura-carpetas.md](Docs/01-estructura-carpetas.md) | Descripción de cada carpeta (`Scripts`, `Components`, `Styles`, `Assets`, `Database`, `Routes`, `Docs`) y archivos raíz (`server.js`, `package.json`) con su responsabilidad. |
| Instalación local | [Docs/02-instalacion-local.md](Docs/02-instalacion-local.md) | Prerrequisitos, `npm install`, `.env`, creación de BD, carga de `schema.sql` + `seed.sql`, modo dev (2 terminales) y modo producción. |
| Esquema de BD | [Docs/03-esquema-bd.md](Docs/03-esquema-bd.md) | Detalle de las 5 tablas (`skills`, `projects`, `experiences`, `achievements`, `messages`): columnas, tipos, constraints, PKs, índices y diagrama textual (desnormalizado, sin FK por ahora). |
| Decisiones técnicas | [Docs/04-decisiones-tecnicas.md](Docs/04-decisiones-tecnicas.md) | Contexto de las decisiones iniciales del stack. |
| Despliegue | [Docs/05-despliegue.md](Docs/05-despliegue.md) | Referencia histórica; la guía vigente para MySQL + Vercel está arriba. |

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
│                            #   AchievementsSection, AdminPanel, Footer + atoms
├── Styles/                  # index.css (Tailwind + Bootstrap grid + globals)
│                            # theme.css (variables CSS del tema)
├── Assets/                  # Imágenes, SVG, favicon, fuentes locales
├── Database/
│   ├── connection.js        # Pool mysql2 con variables .env
│   ├── schema.sql           # DDL MySQL: 6 tablas + índices
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

Diseño **desnormalizado**: 6 tablas independientes, sin FKs explícitos en esta etapa. Motor: **MySQL**.

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
| `npm run dev` | Levanta Vite en modo desarrollo (puerto 5179, HMR). |
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
| `GET` | `/api/profile` | Información pública del perfil. |
| `PUT` | `/api/profile` | Actualiza el perfil (requiere sesión de administrador). |
| `POST` | `/api/auth/login` | Inicia la sesión del panel de administración. |

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
| Panel de administración protegido | ✅ Listo |
| Hooks personalizados (useApiData, useScrollSpy) | ✅ Listo |
| Documentación (Docs/ 1–5 + README) | ✅ Listo |
| Pruebas locales de build y servidor | Pendiente |
| Despliegue a Render / Vercel+Railway | Pendiente |
| Placeholders: `LINK_REPOSITORIO_GIT`, `LINK_DESPLIEGUE_PRODUCCION` | ⚠️ Reemplazar cuando estén disponibles |
