# Stocker — Sistema de Control de Stock

Aplicación de gestión de stock para un distribuidor de retenes y sellos automotrices (**Stocker**).
Backend REST en **Node.js + Express** sobre **MySQL / TiDB Cloud** y frontend móvil
multiplataforma en **React Native + Expo** (Android, iOS y Web).

Trabajo Integrador — la base de datos se genera a partir de la lista de precios real
de EMIC (Excel, vigencia 01-Nov-2025).

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js ≥ 20, Express 4, ES Modules |
| Base de datos | MySQL compatible con TiDB Cloud (TLS obligatorio) |
| Validación | Zod |
| Auth | JWT (access + refresh), bcryptjs, OAuth social (Google / Facebook / GitHub) |
| Frontend | React Native 0.88, Expo SDK 58, React 19 |
| Navegación | React Navigation 7 (stack + drawer + tabs) |
| Estado | Redux Toolkit + React Redux |
| Estilos | NativeWind v4 + Tailwind CSS v3 |
| Build móvil | EAS Build (perfil `preview` → `.apk`) |
| Deploy backend | Render (Blueprint `render.yaml`) |

---

## Estructura

```
trabajointegrador/
├─ server.js                  # Entrada del backend (Express)
├─ Server/
│  ├─ config/                 # env.js (único acceso a process.env), db.js
│  ├─ middlewares/            # autenticación, errores, rate limit, validación
│  ├─ rutas/                  # endpoints REST (/api/v1/*)
│  ├─ servicios/              # lógica de negocio
│  └─ utils/                  # http, jwt, paginación
├─ SQL/                       # 01_schema → 06_seed_productos, 99_rollback
├─ Scripts/                   # importador del Excel + ejecutor de SQL
├─ imports/                   # Excel de precios y logs de importación
├─ Docs/                      # Guia_TiDB.md, Manual_de_Usuario.md
├─ client/                    # App Expo (Layout C: monorepo con carpeta propia)
│  └─ src/
│     ├─ componentes/         # ui/ y popups/ (sin Alert nativo)
│     ├─ estado/              # Redux Toolkit (sesionSlice, store)
│     ├─ navegacion/          # MarcoApp, BarraLateral, menu.ts
│     ├─ pantallas/           # CargaInicial, InicioSesion, ...
│     ├─ servicios/           # api.ts (cliente HTTP), almacenamiento.ts
│     ├─ tema/                # proveedor de tema + tokens de diseño
│     └─ utils/
├─ render.yaml                # Blueprint de despliegue en Render
└─ .env.example               # Plantilla de variables del backend
```

---

## Requisitos

- Node.js ≥ 20 (probado con v22.16.0)
- npm ≥ 10
- Cuenta de TiDB Cloud (o MySQL 8 local)
- Para el APK: cuenta de Expo y EAS CLI (`npm i -g eas-cli`)

---

## Instalación

### 1. Backend

```bash
cd trabajointegrador
npm install
cp .env.example .env      # Windows: copy .env.example .env
# Completar credenciales reales en .env
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

---

## Variables de entorno

### Backend (`.env` en la raíz)

| Variable | Descripción |
| --- | --- |
| `NODE_ENV` | `development` \| `production` |
| `PORT` | Puerto del servidor (4000) |
| `API_PREFIX` | Prefijo de la API (`/api/v1`) |
| `DB_HOST` / `DB_PORT` | Host y puerto de TiDB (TiDB usa **4000**) |
| `DB_USER` | Usuario, formato `<prefijo>.root` |
| `DB_PASSWORD` / `DB_NAME` | Credenciales y esquema |
| `DB_SSL` | `true` (TiDB exige TLS) |
| `DB_SSL_CA` | Ruta opcional al certificado CA |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos (≥ 32 caracteres) |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Vigencia (`15m` / `7d`) |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Límite de peticiones |
| `GOOGLE_*` / `FACEBOOK_*` / `GITHUB_*` | Credenciales OAuth (opcional) |
| `EXCEL_PATH` / `IMPORT_LOG_DIR` | Rutas del importador y sus logs |

### Frontend (`client/.env`)

Sólo las variables con prefijo `EXPO_PUBLIC_` llegan al bundle.

| Variable | Descripción |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL base de la API, **incluyendo** `/api/v1` |
| `EXPO_PUBLIC_API_TIMEOUT` | Timeout de peticiones en ms (20000) |

Valores típicos de `EXPO_PUBLIC_API_URL`:

- Emulador Android: `http://10.0.2.2:4000/api/v1`
- Web / iOS: `http://localhost:4000/api/v1`
- Dispositivo físico (Expo Go): `http://<IP-LAN-de-la-PC>:4000/api/v1`

---

## Comandos

### Backend (desde la raíz)

```bash
npm start              # Arranca la API
npm run dev            # Modo desarrollo (nodemon)
npm run db:migrate     # Ejecuta los scripts SQL en orden
npm run db:rollback    # Revierte el esquema (99_rollback.sql)
npm run import:excel   # Importa la lista de precios del Excel
npm run import:sql     # Genera el SQL sin ejecutarlo (--solo-sql)
npm test               # Suite de pruebas (Jest + Supertest)
```

### Frontend (desde `client/`)

```bash
npm start              # Metro + QR (Expo Go)
npm run web            # Abre en el navegador
npm run android        # Abre en emulador Android
npm run ios            # Abre en simulador iOS
npm run typecheck      # Verificación de tipos (tsc --noEmit)
```

---

## API REST

Prefijo: `/api/v1`. `/health` y `/auth` son públicos; el resto exige access token.

| Método / Ruta | Descripción |
| --- | --- |
| `GET /health` | Estado del servicio y de la base de datos |
| `/auth` | Login, registro, refresh, OAuth social |
| `/usuarios` | ABM de usuarios |
| `/categorias` | ABM de categorías |
| `/productos` | ABM de productos |
| `/stock` | Movimientos y consulta de stock |
| `/precios` | Listas de precios y actualizaciones |
| `/dashboard` | Métricas y resumen |
| `/reportes` | Reportes y exportaciones |
| `/auditoria` | Bitácora de acciones |
| `/importacion` | Importación desde Excel |

Ejemplo:

```bash
curl http://localhost:4000/api/v1/health
# {"ok":true,"datos":{"estado":"ok","version":"1.0.0",...}}
```

---

## Roles

| Rol | Alcance |
| --- | --- |
| Administrador | Acceso total: usuarios, precios, importación, auditoría |
| Encargado de depósito | Stock, productos, movimientos, reportes |
| Vendedor | Consulta de productos, precios y stock |

---

## Base de datos (TiDB)

El esquema se ejecuta en orden desde `SQL/`:

```
01_schema.sql → 02_tables.sql → 03_indexes.sql → 04_seed_roles_admin.sql
→ 05_views.sql → 06_seed_productos.sql
```

Restricciones de compatibilidad con TiDB Cloud:

- Sin stored procedures, triggers, FULLTEXT ni SAVEPOINT.
- Transacciones con `SELECT ... FOR UPDATE` y reintentos ante errores `9007` / `8022`.
- TLS obligatorio.

Ver [Guia_TiDB.md](Docs/Guia_TiDB.md) para el detalle y [Manual_de_Usuario.md](Docs/Manual_de_Usuario.md) para la guía de uso de la aplicación y configuración de OAuth.

---

## Despliegue

### Backend en Render

El archivo `render.yaml` define el Blueprint (`rootDir: trabajointegrador`,
health check en `/api/v1/health`). Los secretos de TiDB y los `JWT_*` se cargan
desde el panel de Render (`sync: false` / `generateValue: true`).

### APK Android (EAS)

```bash
cd client
eas login
eas build --platform android --profile preview
```

El perfil `preview` genera un `.apk` e inyecta `EXPO_PUBLIC_API_URL` desde
`eas.json`. Para que el dispositivo físico alcance la API en HTTP local se usa
`expo-build-properties` con `usesCleartextTraffic: true` (Android 9+ bloquea
tráfico en claro por defecto).

---

## Notas de desarrollo

- `Server/config/env.js` es el **único** punto que lee `process.env`.
- El frontend **no** usa `alert` / `confirm` / `prompt`: los diálogos se resuelven
  con un sistema propio basado en Context (`PopUpsProvider`).
- El proyecto vive dentro de OneDrive: la sincronización de `node_modules` puede
  provocar recargas del watcher de Metro. Si Metro falla, reiniciar con
  `npx expo start --clear`.
