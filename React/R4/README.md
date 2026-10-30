# Portfolio Personal - React + Tailwind + SQL

Portfolio personal full-stack: frontend en React (Vite), backend Express y base de datos MySQL-compatible en TiDB Cloud. Se despliega en Vercel. Incluye un portfolio público y un panel de administración para gestionar su contenido.

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
| **Base de datos** | TiDB Cloud (compatible con MySQL 8), `mysql2` |
| **Despliegue** | Vercel (frontend estático + API como función serverless) |
| **Formato módulos** | ESM en todo el proyecto (`"type": "module"`) |

---

## Tabla de Contenidos

1. [Puesta en marcha (local)](#puesta-en-marcha-local)
2. [Despliegue: Vercel + TiDB Cloud](#despliegue-vercel--tidb-cloud-paso-a-paso)
3. [Documentación Detallada](#documentación-detallada)
4. [Estructura de Carpetas (resumen)](#estructura-de-carpetas-resumen)
5. [Esquema de Base de Datos (resumen)](#esquema-de-base-de-datos-resumen)
6. [Scripts Disponibles](#scripts-disponibles)
7. [Endpoints de la API](#endpoints-de-la-api)
8. [Estado del Proyecto](#estado-del-proyecto)

---

## Puesta en marcha (local)

El proyecto es **compatible con MySQL** (usa `mysql2`), así que sirve tanto una base MySQL local (XAMPP / phpMyAdmin) como un clúster de **TiDB Cloud** en la nube. El despliegue final usa TiDB Cloud: ver [Despliegue: Vercel + TiDB Cloud](#despliegue-vercel--tidb-cloud-paso-a-paso).

### 1. Requisitos

- Node.js 18 o superior.
- Una base MySQL-compatible: MySQL 8+ local **o** un clúster de TiDB Cloud.

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

Editá `.env` según la base que vayas a usar.

**MySQL local (XAMPP / phpMyAdmin):**

```dotenv
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=portfolio_db
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL
DB_SSL=false
ADMIN_USERNAME=admin
ADMIN_PASSWORD=una_contraseña_larga
ADMIN_SESSION_SECRET=un_secreto_aleatorio_largo
VITE_API_BASE_URL=http://localhost:3001
```

**TiDB Cloud:**

```dotenv
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_NAME=portfolio_db
DB_USER=TU_USUARIO_DE_TIDB.root
DB_PASSWORD=TU_PASSWORD_DE_TIDB
DB_SSL=true
```

> También podés usar `DATABASE_URL=mysql://TU_USUARIO_DE_TIDB.root:TU_PASSWORD_DE_TIDB@TU_HOST:4000/portfolio_db`. Si existe, tiene prioridad sobre las variables `DB_*`. El TLS se activa solo cuando `DB_SSL=true` o cuando el host termina en `tidbcloud.com`.

### 3. Crear e inicializar la base de datos

**Opción A — phpMyAdmin (MySQL local):**

1. Entrá a phpMyAdmin y abrí la pestaña **Importar**.
2. Elegí el archivo `Database/phpmyadmin.sql` y presioná **Continuar**.
3. Ese único archivo crea la base `portfolio_db`, las 6 tablas, los índices y carga los datos iniciales.

**Opción B — línea de comandos:**

```powershell
mysql -u root -p -e "CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p portfolio_db < Database/schema.sql
mysql -u root -p portfolio_db < Database/seed.sql
```

Contra TiDB Cloud el cliente MySQL 8+ exige TLS (`--ssl-mode=REQUIRED`):

```powershell
mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED -e "CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED portfolio_db < Database/schema.sql
mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED portfolio_db < Database/seed.sql
```

> `schema.sql` elimina y vuelve a crear las tablas. No lo ejecutes sobre una base de datos con información que quieras conservar.
> Si tu usuario no es `root`, reemplazalo en los comandos y en `.env`.

### 4. Iniciar el proyecto

Abrí dos terminales en la raíz del proyecto:

```powershell
# Terminal 1: API Express + base de datos
npm run server:dev

# Terminal 2: frontend Vite
npm run dev
```

Abrí [http://localhost:5179](http://localhost:5179). Vite redirige las solicitudes `/api` al servidor Express en `http://localhost:3001`.

### Panel de administración

El panel está disponible en [http://localhost:5179/admin](http://localhost:5179/admin). Permite editar el perfil, tecnologías, proyectos, experiencia y certificaciones; cada cambio se guarda en la base de datos.

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

Contra TiDB Cloud:

```powershell
mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED portfolio_db < Database/migration-admin.sql
```

3. Reiniciá `npm run server:dev` e ingresá a `/admin` con las credenciales configuradas.

> Para reemplazar también los antiguos datos de ejemplo por el contenido actual del portfolio, ejecutá de nuevo `schema.sql` y `seed.sql`. Este reinicio elimina los registros existentes; después podrás gestionarlos desde `/admin`.

## Despliegue: Vercel + TiDB Cloud (paso a paso)

Arquitectura final: **frontend Vite + API Express en Vercel** (un solo dominio, la API vive en `/api/*`) y **base de datos TiDB Cloud** en la nube. El archivo `vercel.json` envía `/api/*` a la función serverless `api/index.js`, sirve el build de `dist/` y resuelve `/admin`.

### Paso 0 — Seguridad antes de subir

Las credenciales que estuvieron en `.env` y `.env.example` quedaron guardadas en el historial de Git, así que hay que rotarlas:

1. Cambiá esas contraseñas en sus servicios (sobre todo `ADMIN_PASSWORD` y la de la base).
2. Dejá de versionar `.env`:

```powershell
git rm --cached .env
```

3. Verificá que `.gitignore` (ya incluido en el proyecto) ignore `.env`, `node_modules/` y `dist/`.

### Paso 1 — Crear el clúster en TiDB Cloud

1. Entrá a [tidbcloud.com](https://tidbcloud.com) y creá una cuenta.
2. **Create Cluster → Serverless** (capa gratuita). Elegí la región más cercana a tus usuarios.
3. Cuando el clúster esté listo, hacé click en **Connect** y copiá estos datos:

| Dato | Ejemplo |
|------|---------|
| `Host` | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `Port` | `4000` |
| `User` | `3Fxxxxxxx.root` |
| `Password` | (se muestra una sola vez) |

4. En esa misma pantalla agregá tu red en **IP Access List → Allow access from anywhere (`0.0.0.0/0`)**. Vercel no publica IPs fijas, así que sin esto la API no puede conectarse.

### Paso 2 — Crear la base y cargar el esquema

Desde tu máquina, con el cliente `mysql` 8+ instalado:

```powershell
mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED -e "CREATE DATABASE IF NOT EXISTS portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED portfolio_db < Database/schema.sql

mysql --host TU_HOST --port 4000 --user TU_USUARIO --password --ssl-mode=REQUIRED portfolio_db < Database/seed.sql
```

> Alternativa sin cliente `mysql`: en la consola de TiDB Cloud abrí el **SQL Editor** y ejecutá primero `Database/schema.sql` y después `Database/seed.sql`.

### Paso 3 — Probar en local contra TiDB (recomendado)

Poné las credenciales de TiDB en `.env` (con `DB_SSL=true`) y levantá el proyecto con `npm run server:dev` + `npm run dev`. Si el portfolio carga datos y `/admin` guarda cambios, la conexión TLS está funcionando y el despliegue va a andar.

### Paso 4 — Subir el repositorio a GitHub

```powershell
git add .
git commit -m "Adaptar despliegue a Vercel + TiDB Cloud"
git push
```

> El repositorio es un monorepo y el proyecto vive en la subcarpeta `R4/`. Eso se define en el paso siguiente como **Root Directory**.

### Paso 5 — Importar el proyecto en Vercel

1. En [vercel.com/new](https://vercel.com/new) importá el repositorio.
2. Confirmá esta configuración (coincide con lo declarado en `vercel.json`):

| Campo | Valor |
|-------|-------|
| **Root Directory** | `R4` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

3. En **Environment Variables** (Production, y Preview si querés) agregá:

```text
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_NAME=portfolio_db
DB_USER=TU_USUARIO_DE_TIDB.root
DB_PASSWORD=TU_PASSWORD_DE_TIDB
DB_SSL=true
ADMIN_USERNAME=tu_usuario_unico
ADMIN_PASSWORD=una_contraseña_larga_y_unica
ADMIN_SESSION_SECRET=un_secreto_aleatorio_largo
```

En lugar de las variables `DB_*` podés usar una sola cadena de conexión:

```text
DATABASE_URL=mysql://usuario:password@host:4000/portfolio_db
```

> No definas `PORT` (Vercel lo inyecta) ni `VITE_API_BASE_URL` (dejala vacía o sin definir: el frontend llama a `/api/*` en el mismo dominio, sin CORS). `NODE_ENV=production` lo aplica Vercel automáticamente.

4. Hacé click en **Deploy**.

### Paso 6 — Verificar el despliegue

Con el dominio `https://TU-PROYECTO.vercel.app`:

| Prueba | Resultado esperado |
|--------|--------------------|
| `/` | El portfolio carga con los datos que vienen de TiDB |
| `/api/skills` | Devuelve el JSON de habilidades |
| `/api/profile` | Devuelve el perfil público |
| `/admin` | Permite iniciar sesión y guardar cambios |
| Formulario de contacto | Inserta un registro en la tabla `messages` |

Si `/api/*` responde 500: revisá que el **IP Access List** de TiDB incluya `0.0.0.0/0` y que `DB_SSL=true`.

### Paso 7 — Dominio propio (opcional)

En Vercel: **Project → Settings → Domains → Add**. Cargá tu dominio y configurá el DNS que te indique.

---

## Documentación Detallada

Toda la guía extendida vive en la carpeta [Docs/](Docs/):

| Documento | Link | Qué contiene |
|-----------|------|--------------|
| Estructura de carpetas | [Docs/01-estructura-carpetas.md](Docs/01-estructura-carpetas.md) | Descripción de cada carpeta (`Scripts`, `Components`, `Styles`, `Assets`, `Database`, `Routes`, `Docs`) y archivos raíz (`server.js`, `package.json`) con su responsabilidad. |
| Instalación local | [Docs/02-instalacion-local.md](Docs/02-instalacion-local.md) | Prerrequisitos, `npm install`, `.env`, creación de BD, carga de `schema.sql` + `seed.sql`, modo dev (2 terminales) y modo producción. |
| Esquema de BD | [Docs/03-esquema-bd.md](Docs/03-esquema-bd.md) | Detalle de las 5 tablas (`skills`, `projects`, `experiences`, `achievements`, `messages`): columnas, tipos, constraints, PKs, índices y diagrama textual (desnormalizado, sin FK por ahora). |
| Decisiones técnicas | [Docs/04-decisiones-tecnicas.md](Docs/04-decisiones-tecnicas.md) | Contexto de las decisiones iniciales del stack. |
| Despliegue | [Docs/05-despliegue.md](Docs/05-despliegue.md) | Referencia histórica (Render y Railway). La guía vigente para Vercel + TiDB Cloud está más arriba. |

> `Docs/02` y `Docs/03` conservan ejemplos con PostgreSQL de una etapa anterior del proyecto. La referencia vigente para MySQL local y TiDB Cloud es este README.

---

## Estructura de Carpetas (resumen)

```
R4/
├── server.js                # Express local: sirve dist/ + monta /api/*
├── vercel.json              # Config Vercel: build de Vite + /api/* → función
├── api/
│   └── index.js             # Función serverless que expone el app Express
├── package.json             # Dependencias, scripts, engines, type: module
├── .env.example             # Plantilla de variables de entorno
├── .gitignore               # Ignora .env, node_modules/, dist/, .vercel
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
│   ├── connection.js        # Pool mysql2 (MySQL local o TiDB Cloud con TLS)
│   ├── schema.sql           # DDL MySQL: 6 tablas + índices
│   ├── seed.sql             # Datos iniciales de ejemplo
│   ├── migration-admin.sql  # Migración no destructiva del panel /admin
│   └── phpmyadmin.sql       # Import único para phpMyAdmin (base + tablas + datos)
├── Routes/                  # Express Routers por recurso
│   ├── skills.js            #   GET /api/skills
│   ├── projects.js          #   GET /api/projects
│   ├── experiences.js       #   GET /api/experiences
│   ├── achievements.js      #   GET /api/achievements
│   ├── messages.js          #   POST /api/messages
│   ├── auth.js              #   POST /api/auth/login
│   └── profile.js           #   GET y PUT /api/profile
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
- **Producción (Vercel):** `/api` (relativa al mismo dominio que el frontend)

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
| Base de datos en TiDB Cloud + esquema cargado | Pendiente |
| Despliegue a Vercel | Pendiente |
| Placeholders: `LINK_REPOSITORIO_GIT`, `LINK_DESPLIEGUE_PRODUCCION` | ⚠️ Reemplazar cuando estén disponibles |
