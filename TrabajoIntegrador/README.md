# Sistema de Control de Stock — Retenes EMIC

Aplicación integral para la gestión de stock de un distribuidor de **retenes y sellos
automotrices (EMIC)**: catálogo de productos por medidas, movimientos de stock
transaccionales, control de precios con historial, alertas de stock mínimo, reportes
exportables y auditoría de operaciones.

El sistema se compone de:

- **Backend** — API REST (Node.js + Express, ES Modules) en la raíz del repositorio.
- **Frontend** — App multiplataforma (React Native + Expo) en `client/`, ejecutable como
  **APK Android** y como **aplicación web para PC (1920×1080)**.
- **Base de datos** — MySQL / MariaDB con scripts SQL versionados en `SQL/`.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Estructura del repositorio](#estructura-del-repositorio)
3. [Requisitos previos](#requisitos-previos)
4. [Puesta en marcha rápida](#puesta-en-marcha-rápida)
5. [Variables de entorno](#variables-de-entorno)
6. [Base de datos](#base-de-datos)
7. [Importación de la lista de precios (Excel)](#importación-de-la-lista-de-precios-excel)
8. [Ejecución del backend](#ejecución-del-backend)
9. [Ejecución del frontend](#ejecución-del-frontend)
10. [Generación del APK](#generación-del-apk)
11. [Roles y permisos](#roles-y-permisos)
12. [Documentación de la API](#documentación-de-la-api)
13. [Estructura de respuesta](#estructura-de-respuesta)
14. [Sistema de estilos y grilla](#sistema-de-estilos-y-grilla)
15. [Seguridad](#seguridad)
16. [Control de versiones (Conventional Commits)](#control-de-versiones-conventional-commits)
17. [Documentación adicional](#documentación-adicional)

---

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Node.js ≥ 18 (probado en 22.16), Express 4, ES Modules (`"type":"module"`), Zod, bcryptjs, jsonwebtoken, multer, xlsx, helmet, cors, express-rate-limit, morgan, mysql2/promise |
| **Base de datos** | MySQL / MariaDB 10.4+, InnoDB, `utf8mb4`, índices FULLTEXT, vistas, triggers y stored procedures |
| **Frontend** | Expo SDK 58, React 19, React Native 0.88, React Navigation 7, Redux Toolkit 2 + RTK Query, NativeWind 4 (TailwindCSS 3), axios, expo-secure-store, react-native-web |
| **Estilos** | TailwindCSS vía NativeWind + grilla; tema claro/oscuro con paleta cálida otoñal (tokens centralizados) |

---

## Estructura del repositorio

```
TrabajoIntegrador/
├── server.js                  # Punto de entrada del backend
├── package.json               # Dependencias del backend
├── .env.example               # Plantilla de variables de entorno del backend
├── .gitignore
│
├── BACKEND/                   # Código del backend (arquitectura por capas)
│   ├── config/                # env, db (pool + transacciones), logger, multer
│   ├── controllers/           # Adaptadores HTTP
│   ├── services/              # Lógica de negocio
│   ├── repositories/          # Acceso a datos
│   ├── routes/                # Definición de endpoints /api/v1
│   ├── middlewares/           # auth, roles, validación, errores, rate limit
│   ├── validators/            # Esquemas Zod
│   ├── utils/                 # jwt, password, response, pagination, csv, ApiError
│   └── import/                # Parser e importador de Excel
│
├── SQL/                       # Scripts de base de datos (ejecutar 01 → 06)
│   ├── 01_schema.sql
│   ├── 02_tables.sql
│   ├── 03_indexes.sql
│   ├── 04_seed_roles_admin.sql
│   ├── 05_views.sql
│   └── 06_triggers_procedures.sql
│
├── Docs/                      # Documentación del proyecto
│   ├── Manual_de_Usuario.md
│   ├── Guia_de_Instalacion.md
│   ├── Guia_APK.md
│   ├── Diagramas.md
│   ├── Guion_Video.md
│   └── Checklist_Final.md
│
├── Tests/                     # Pruebas unitarias (node:test)
│
└── client/                    # Frontend Expo (Android + Web)
    ├── App.js
    ├── Components/            # Atomic Design: atoms / molecules / organisms
    ├── Screens/               # Pantallas de la aplicación
    ├── Navigation/            # React Navigation + items por rol
    ├── Store/                 # Redux Toolkit + RTK Query
    ├── Services/              # apiConfig, http, storage, export
    ├── Styles/                # Tema y ThemeProvider (claro/oscuro)
    ├── Utils/                 # helpers (format, responsive, roles, cn)
    ├── Assets/                # Íconos, splash
    ├── app.json               # Configuración Expo
    └── .env.example           # Plantilla EXPO_PUBLIC_API_URL
```

---

## Requisitos previos

- **Node.js** ≥ 18 (recomendado 20 o 22) y npm.
- **MySQL** o **MariaDB** ≥ 10.4 (se puede usar MySQL Workbench).
- **Expo Go** en el teléfono (para pruebas rápidas) y/o **EAS CLI** (para generar el APK).
- Cuenta de Expo ([expo.dev](https://expo.dev)) para el build en la nube.

---

## Puesta en marcha rápida

```bash
# 1) Backend: instalar dependencias y configurar entorno
npm install
copy .env.example .env        # Windows  (cp en Linux/macOS) y editar credenciales MySQL

# 2) Base de datos: ejecutar los scripts en orden en MySQL Workbench
#    SQL/01_schema.sql ... SQL/06_triggers_procedures.sql

# 3) Importar la lista de precios (Excel) a la base
npm run import:excel

# 4) Levantar el backend (http://localhost:4000/api/v1)
npm start

# 5) Frontend
cd client
npm install
copy .env.example .env        # ajustar EXPO_PUBLIC_API_URL si hace falta
npm run web                   # navegador PC   |   npm start para Expo Go
```

Usuario inicial de prueba: **`admin@retenes.com` / `Admin123!`**

---

## Variables de entorno

### Backend — `.env` (raíz)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del API | `4000` |
| `API_PREFIX` | Prefijo de las rutas | `/api/v1` |
| `DB_HOST` / `DB_PORT` | Host y puerto de MySQL | `localhost` / `3306` |
| `DB_USER` / `DB_PASSWORD` | Credenciales MySQL | `root` / *(vacío)* |
| `DB_NAME` | Nombre de la base | `retenes_stock` |
| `DB_CONNECTION_LIMIT` | Tamaño del pool | `10` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Claves de firma (distintas) | texto largo aleatorio |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Vigencia de tokens | `15m` / `7d` |
| `CORS_ORIGIN` | Origen permitido (`*` refleja el origen) | `http://localhost:8081` |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Ventana y máximo de peticiones | `900000` / `300` |
| `GOOGLE_/FACEBOOK_/GITHUB_CLIENT_ID` y `_SECRET` | Credenciales OAuth social | *(opcional)* |
| `OAUTH_CALLBACK_BASE_URL` | URL base para redirect OAuth | `http://localhost:4000` |
| `EXCEL_PATH` | Ruta del Excel a importar | `./imports/...xlsx` |
| `IMPORT_LOG_DIR` | Carpeta de logs de importación | `./imports/logs` |

### Frontend — `client/.env`

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | URL base del API. Web/emulador: `http://localhost:4000/api/v1` (Android emulator usa `10.0.2.2` por defecto). **Teléfono físico (Expo Go): `http://<IP-LAN-PC>:4000/api/v1`** |

> ⚠️ `.env` **no** se versiona (está en `.gitignore`). Usar siempre `.env.example` como plantilla.

---

## Base de datos

Modelo relacional (InnoDB, `utf8mb4`). Diagrama en [`Docs/Diagramas.md`](Docs/Diagramas.md).

**Tablas (13):** `roles`, `usuarios`, `proveedores_oauth`, `refresh_tokens`, `categorias`,
`productos`, `equivalencias`, `stock`, `movimientos_stock`, `historial_precios`,
`alertas_stock`, `auditoria`, `configuracion`.

**Vistas (5):** `v_stock_actual`, `v_productos_stock_bajo`, `v_valor_stock`,
`v_ultimos_movimientos`, `v_resumen_por_categoria`.

**Rutinas:** `sp_registrar_movimiento` (procedure transaccional) y `tr_alertas_stock` (trigger
que genera alertas cuando el stock cae por debajo del mínimo).

Orden de ejecución obligatorio en MySQL Workbench: `01` → `02` → `03` → `04` → `05` → `06`.

> `01_schema.sql` **elimina y recrea** la base `retenes_stock`. Ejecutarlo con cuidado en
> entornos con datos.

---

## Importación de la lista de precios (Excel)

El parser lee la hoja **“Por Medidas”** del archivo
`Retenes_EMIC__Lista_de_Precios_-_Vigencia_01_Nov_2025.xlsx` y hace *upsert* de productos,
categorías, medidas, equivalencias y precios de lista.

```bash
# Analizar sin escribir en la base (dry-run)
npm run import:excel:dry

# Importar (inserciones + actualizaciones)
npm run import:excel

# Opciones adicionales
node BACKEND/import/importarExcel.js --file=./imports/otro.xlsx
node BACKEND/import/importarExcel.js --truncate   # vacía el catálogo antes de importar
```

La importación genera un **log JSON detallado** (descartes y advertencias) en
`IMPORT_LOG_DIR`. También puede hacerse desde la app (módulo **Precios → Importar**), con
**vista previa** antes de confirmar (sólo Administrador).

Estado validado: **365 productos**, **5 categorías** y **558 equivalencias**, sin errores.

---

## Ejecución del backend

```bash
npm start        # producción
npm run dev      # desarrollo con recarga (nodemon)
npm run lint     # análisis estático ESLint
```

- API: `http://localhost:4000/api/v1`
- Salud: `http://localhost:4000/health`
- Raíz: `http://localhost:4000/`

---

## Ejecución del frontend

```bash
cd client
npm run web        # navegador (PC 1920x1080)
npm start          # Expo (QR para Expo Go en el teléfono)
npm run android    # emulador Android
```

En **teléfono físico** con Expo Go, configurar `client/.env` apuntando a la **IP LAN** de la PC
(no `localhost`) y que ambos estén en la misma red. El backend debe escuchar en `0.0.0.0`
(por defecto) y el firewall debe permitir el puerto `4000`.

---

## Generación del APK

El APK se genera con **EAS Build** (recomendado) o de forma local con `expo prebuild` +
Gradle. Guía completa en [`Docs/Guia_APK.md`](Docs/Guia_APK.md).

```bash
cd client
npm install -g eas-cli
eas login
eas build -p android --profile preview   # genera APK instalable
```

---

## Roles y permisos

| Rol | Alcance |
|-----|---------|
| **Administrador** | Acceso total: usuarios, roles, categorías, productos, stock, precios, importación, reportes, auditoría y configuración. |
| **Encargado de Deposito** | ABM de productos y categorías, movimientos de stock, precios y reportes. Sin gestión de usuarios. |
| **Vendedor** | Consulta de catálogo, stock y precios; puede registrar **egresos por venta**; reportes. |

La autorización se aplica en el **backend** (middleware `roleRequired`) y se refleja en la UI
filtrando la navegación por rol (`client/Navigation/navItems.js`).

---

## Documentación de la API

Base URL: `/api/v1` · Formato: **JSON** · Autenticación: **Bearer JWT** (access token).

### Auth — `/auth`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/auth/register` | público | Registro con nombre, apellido, email y password |
| POST | `/auth/login` | público | Login → `{ usuario, accessToken, refreshToken }` |
| POST | `/auth/social/:proveedor` | público | Login social (`google` \| `facebook` \| `github`) con `accessToken` del proveedor |
| POST | `/auth/refresh` | público | Rota el refresh token y emite un nuevo par |
| POST | `/auth/logout` | público | Revoca el refresh token |
| GET | `/auth/me` | autenticado | Datos del usuario actual |
| PATCH | `/auth/password` | autenticado | Cambio de contraseña |

### Usuarios — `/usuarios` (sólo Administrador)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios` | Listado paginado |
| GET | `/usuarios/:id` | Detalle |
| POST | `/usuarios` | Crear (requiere `rolId` y `password`) |
| PUT | `/usuarios/:id` | Actualizar |
| PATCH | `/usuarios/:id/estado` | Activar/desactivar (revoca tokens) |
| PATCH | `/usuarios/:id/rol` | Cambiar rol |
| DELETE | `/usuarios/:id` | Eliminar |

### Roles — `/roles` (sólo Administrador)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/roles` | Catálogo de roles |
| GET | `/roles/:id` | Detalle |

### Categorías — `/categorias`

| Método | Ruta | Rol |
|--------|------|-----|
| GET | `/categorias` · `/categorias/:id` | autenticado |
| POST | `/categorias` · PUT `/categorias/:id` | Admin + Depósito |
| DELETE | `/categorias/:id` | Admin |

### Productos — `/productos`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/productos` | autenticado | Listado con filtros (`categoriaId`, `giro`, `codigo`, `texto`, `activo`, `stockBajo`) y paginación |
| GET | `/productos/buscar` | autenticado | Búsqueda avanzada: `codigo`, `eje`, `aloj`, `alt`, `tolerancia`, `oem`, `texto` |
| GET | `/productos/:id` | autenticado | Detalle |
| POST | `/productos` | Admin + Depósito | Crear |
| PUT | `/productos/:id` | Admin + Depósito | Actualizar |
| PATCH | `/productos/:id/stock-minimo` | Admin + Depósito | Fijar stock mínimo |
| DELETE | `/productos/:id` | Admin | Eliminar |

### Movimientos de stock — `/movimientos`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/movimientos` | autenticado | Historial (`productoId`, `tipo`, `desde`, `hasta`) |
| GET | `/movimientos/ultimos` | autenticado | Últimos movimientos |
| POST | `/movimientos` | Admin + Depósito + Vendedor | Registrar movimiento (`tipo`: `INGRESO` \| `EGRESO` \| `AJUSTE`) |

### Precios — `/precios`

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/precios/producto/:id/historial` | autenticado | Historial de precios del producto |
| PUT | `/precios/producto/:id` | Admin + Depósito | Actualizar precio (registra historial) |
| POST | `/precios/importar/preview` | Admin | Vista previa de importación (multipart `archivo`) |
| POST | `/precios/importar/confirmar` | Admin | Confirmar importación |

### Reportes — `/reportes` (Admin + Depósito + Vendedor)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/reportes/stock` | Reporte de stock |
| GET | `/reportes/stock/export` | Export CSV de stock |
| GET | `/reportes/movimientos` | Reporte de movimientos |
| GET | `/reportes/movimientos/export` | Export CSV de movimientos |
| GET | `/reportes/valor` | Valorización del inventario |

### Dashboard — `/dashboard` (autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard` | KPIs: totales, valor de stock, unidades, stock bajo, próximos ingresos, por categoría, últimos movimientos y precios |
| GET | `/dashboard/alertas` | Alertas de stock pendientes |

### Importación — `/import` (sólo Administrador)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/import/preview` | Vista previa del Excel (multipart `archivo`) |
| POST | `/import/confirm` | Importar catálogo desde Excel |

### Auditoría y Configuración

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/auditoria` | Admin | Bitácora de cambios |
| GET | `/configuracion/publica` | público | Config pública (empresa, moneda, tolerancia) |
| GET | `/configuracion` | Admin | Todas las claves |
| PUT | `/configuracion/:clave` | Admin | Actualizar valor |

---

## Estructura de respuesta

Todas las respuestas exitosas siguen el formato:

```json
{ "ok": true, "data": { } }
```

Los listados agregan metadatos de paginación (`meta`):

```json
{
  "ok": true,
  "data": {
    "items": [ ],
    "meta": { "total": 365, "page": 1, "limit": 20, "totalPages": 19, "hasNext": true, "hasPrev": false }
  }
}
```

Parámetros de paginación: `?page` (≥ 1) y `?limit` (por defecto 20, máximo 100).

Los errores siguen el formato (el `stack` sólo aparece en desarrollo para errores 5xx):

```json
{ "ok": false, "error": { "message": "No autenticado", "details": null } }
```

Códigos habituales: `400` validación, `401` no autenticado/token inválido, `403` sin permisos,
`404` no encontrado, `409` conflicto (duplicado), `422` referencia inexistente,
`429` rate limit, `500` error interno, `503` sin conexión a la base.

---

## Sistema de estilos y grilla

El frontend usa **NativeWind (TailwindCSS)** como motor de estilos (tokens cálidos claro/oscuro en
`client/tailwind.config.js`) y una **grilla de 12 columnas con API estilo Bootstrap** implementada
como componentes (`client/Components/atoms/Grid.js`).

> **¿Por qué no se usa Bootstrap directamente?** Bootstrap es una librería **CSS de DOM** y no
> aplica dentro de **React Native** (no hay HTML/CSS del navegador). Para cumplir el requisito de
> “grilla de 12 columnas, contenedor fluido y breakpoints sm/md/lg/xl/xxl”, se replica el
> **contrato de Bootstrap** con componentes (`Container` / `Row` / `Col`) sobre NativeWind, de modo
> que el **mismo layout funciona en Android y en Web**.

**Breakpoints:** `xs` 0 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1440 · `xxl` 1600
(`client/Utils/responsive.js`).

**Regla de uso (evita conflictos de estilos):**

| Necesidad | Usar |
|-----------|------|
| Estructura de grilla (filas, columnas, spans, contenedor) | `Container` / `Row` / `Col` |
| Detalles visuales (color, tipografía, bordes, sombras, spacing interno) | clases Tailwind `className` |
| Estilo nativo que Tailwind no cubre (sombras, colores de gráficos) | tokens de `client/Styles/theme.js` vía `useTheme()` |

- No mezclar: no usar `w-1/2`, `flex-row` + `gap-*` ni márgenes manuales **para armar grillas**;
  eso queda en `Row`/`Col`.
- Los spans son **responsive y con herencia** (como Bootstrap): `md={6}` aplica desde `md` en
  adelante; si además se define `lg={4}`, se usa `6` en `md` y `4` en `lg`+.

Ejemplo:

```jsx
import { Row, Col } from '../Components/atoms/Grid';

<Row gutter={16}>
  <Col xs={12} lg={6}>…</Col>
  <Col xs={12} lg={6}>…</Col>
</Row>
```

Los **gráficos** del dashboard (`client/Components/molecules/BarChart.js`) se construyen sin
dependencias externas, usando la paleta categórica `chartColors` del tema.

---

## Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rondas) y política mínima de complejidad.
- **JWT** de acceso (15 min) + **refresh** (7 días) con **rotación** y **revocación** en base.
- Middlewares de **autenticación**, **roles**, **validación** (Zod), **rate limit**, **helmet**,
  **CORS** configurable y **logging** (morgan + logger propio).
- Movimientos de stock **transaccionales** con bloqueo de fila (`SELECT ... FOR UPDATE`) para
  evitar condiciones de carrera.
- **Auditoría** de operaciones sensibles (alta/baja de productos, usuarios, precios, importación).
- Secretos y credenciales **fuera del control de versiones** (`.env` ignorado).

---

## Control de versiones (Conventional Commits)

El proyecto sigue **Conventional Commits**: `tipo(alcance): descripción` en imperativo y minúsculas.
Tipos usados: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Historial sugerido (orden cronológico de incorporación de los cambios):

```text
chore: inicializar repositorio con .gitignore y .env.example
feat(db): agregar scripts 01_schema y 02_tables (13 tablas InnoDB utf8mb4)
feat(db): agregar indices, fulltext y vistas (03_indexes, 05_views)
feat(db): agregar seed de roles y usuario admin (04_seed_roles_admin)
feat(db): agregar procedimiento de movimiento y trigger de alertas
feat(import): agregar parser del Excel EMIC y script de importacion con log
feat(api): agregar configuracion, pool mysql2 y utilidades base
feat(auth): agregar registro, login y JWT con refresh rotativo y revocacion
feat(auth): agregar login social (Google, Facebook, GitHub)
feat(api): agregar middlewares de auth, roles, validacion y errores
feat(api): agregar CRUD de usuarios, roles y categorias
feat(api): agregar productos con busqueda avanzada por medidas y FULLTEXT
feat(api): agregar movimientos de stock transaccionales
feat(api): agregar alertas de stock minimo
feat(api): agregar gestion de precios, historial y re-importacion con preview
feat(api): agregar reportes CSV/Excel, dashboard KPIs y auditoria
feat(client): agregar proyecto Expo con NativeWind y tokens de tema
feat(client): agregar sistema de pop-ups propio (success/error/confirm)
feat(client): agregar store Redux Toolkit, RTK Query y sesion persistente
feat(client): agregar navegacion por rol (sidebar/drawer) y pantallas
feat(client): agregar grilla estilo Bootstrap y graficos del dashboard
docs: agregar README con documentacion completa de la API
docs: agregar manual de usuario, guia de instalacion y guia de APK
docs: agregar diagramas ER/arquitectura y guion del video
test: agregar pruebas unitarias de utilidades (node:test)
chore: agregar configuracion de ESLint y Prettier
```

---

## Documentación adicional

- 📘 [Manual de Usuario](Docs/Manual_de_Usuario.md)
- 🛠️ [Guía de Instalación](Docs/Guia_de_Instalacion.md)
- 📱 [Guía de generación del APK](Docs/Guia_APK.md)
- 🗺️ [Diagramas (ER y arquitectura)](Docs/Diagramas.md)
- 🎬 [Guion para el video de presentación](Docs/Guion_Video.md)
- ✅ [Checklist final de requisitos](Docs/Checklist_Final.md)

---

**Proyecto académico integrador** — Sistema de Control de Stock para Retenes EMIC.
