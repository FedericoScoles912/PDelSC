# Guía de Instalación — Sistema de Control de Stock (Retenes EMIC)

Instrucciones paso a paso para instalar y ejecutar el proyecto completo: **base de datos**,
**backend (API)** y **frontend (Expo)**.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Obtener el código](#2-obtener-el-código)
3. [Base de datos (MySQL / MariaDB)](#3-base-de-datos-mysql--mariadb)
4. [Backend (API REST)](#4-backend-api-rest)
5. [Importar la lista de precios (Excel)](#5-importar-la-lista-de-precios-excel)
6. [Frontend (Expo)](#6-frontend-expo)
7. [Ejecutar en el navegador (PC)](#7-ejecutar-en-el-navegador-pc)
8. [Ejecutar en el teléfono (Expo Go)](#8-ejecutar-en-el-teléfono-expo-go)
9. [Login social (OAuth): client ID/secret y redirect URIs](#9-login-social-oauth-client-idsecret-y-redirect-uris)
10. [Verificación](#10-verificación)
11. [Solución de problemas](#11-solución-de-problemas)

---

## 1. Requisitos

| Herramienta | Versión recomendada | Notas |
|-------------|---------------------|-------|
| **Node.js** | ≥ 18 (probado en 22.16 LTS) | Incluye npm |
| **MySQL** o **MariaDB** | ≥ 10.4 | MySQL Workbench es opcional pero cómodo |
| **Git** | cualquiera | Para clonar el repositorio |
| **Expo Go** | última | App en el teléfono para pruebas |
| **EAS CLI** | última | Sólo para generar el APK (`npm i -g eas-cli`) |

Verificar las versiones instaladas:

```bash
node --version
npm --version
mysql --version
```

---

## 2. Obtener el código

```bash
git clone <URL-del-repositorio>
cd TrabajoIntegrador
```

---

## 3. Base de datos (MySQL / MariaDB)

### 3.1 Crear la base y las tablas

Ejecutar los scripts **en orden** en MySQL Workbench (o por consola). El script `01` **crea la
base `retenes_stock`** (y la elimina si ya existía).

**Opción A — MySQL Workbench**

1. Abrir Workbench y conectarse al servidor local.
2. `File → Open SQL Script…` y abrir `SQL/01_schema.sql`, ejecutar.
3. Repetir con `02_tables.sql`, `03_indexes.sql`, `04_seed_roles_admin.sql`, `05_views.sql` y
   `06_triggers_procedures.sql` (en ese orden).

**Opción B — Consola**

```bash
mysql -u root -p < SQL/01_schema.sql
mysql -u root -p < SQL/02_tables.sql
mysql -u root -p < SQL/03_indexes.sql
mysql -u root -p < SQL/04_seed_roles_admin.sql
mysql -u root -p < SQL/05_views.sql
mysql -u root -p < SQL/06_triggers_procedures.sql
```

Al finalizar quedan creadas **13 tablas**, **5 vistas**, el procedimiento
`sp_registrar_movimiento`, el trigger `tr_alertas_stock` y los datos semilla (3 roles,
3 usuarios de prueba, 5 categorías y la configuración inicial).

> Los scripts `05` y `06` terminan con `DELIMITER`, ejecutar el archivo completo (no copiar
> sentencias sueltas en Workbench).

### 3.2 Datos semilla

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@retenes.com` | `Admin123!` |
| Encargado de Depósito | `deposito@retenes.com` | `Deposito123!` |
| Vendedor | `vendedor@retenes.com` | `Vendedor123!` |

---

## 4. Backend (API REST)

### 4.1 Instalar dependencias

Desde la **raíz** del proyecto:

```bash
npm install
```

### 4.2 Configurar variables de entorno

Copiar la plantilla y editar el archivo `.env`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Editar como mínimo:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=retenes_stock

JWT_ACCESS_SECRET=una_clave_larga_y_segura
JWT_REFRESH_SECRET=otra_clave_distinta_igual_de_larga
```

> Usar **claves distintas** para access y refresh. No commitear el `.env`.

### 4.3 Levantar el servidor

```bash
npm start        # http://localhost:4000/api/v1
# o, para desarrollo con recarga automática:
npm run dev
```

Comprobar que responde:

```bash
curl http://localhost:4000/health
# { "ok": true, "data": { "status": "up", "ts": "..." } }
```

---

## 5. Importar la lista de precios (Excel)

El archivo Excel de la lista de precios (`Retenes_EMIC__Lista_de_Precios_-_Vigencia_01_Nov.2025.xlsx`)
debe copiarse a la carpeta `imports/` (crear si no existe) o indicarse con `--file`.

```bash
# 1) Analizar sin escribir en la base (recomendado la primera vez)
npm run import:excel:dry

# 2) Importar de verdad
npm run import:excel
```

Opciones adicionales:

```bash
node BACKEND/import/importarExcel.js --file=./imports/otra_lista.xlsx
node BACKEND/import/importarExcel.js --truncate     # vacía el catálogo antes de importar
```

Resultado esperado: **365 productos** insertados, **5 categorías** y **558 equivalencias**, sin
errores. La importación deja un log detallado (descartes y advertencias) en `imports/logs/`.

> La ruta del Excel se configura con `EXCEL_PATH` en `.env`. La carpeta `imports/` se ignora en
> Git (los `.xlsx` no se versionan).

---

## 6. Frontend (Expo)

```bash
cd client
npm install
```

Configurar `client/.env`:

```bash
Copy-Item .env.example .env      # o cp en Linux/macOS
```

```ini
# Web en la PC y emulador Android
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1

# Teléfono físico (Expo Go): reemplazar por la IP LAN de la PC
# EXPO_PUBLIC_API_URL=http://192.168.0.10:4000/api/v1
```

> **Importante (teléfono físico):** `localhost` apunta al teléfono, no a la PC. Averiguar la IP
> LAN de la PC (`ipconfig` en Windows, `ifconfig` en macOS/Linux) y usar esa IP. El teléfono y la
> PC deben estar en la misma red, y el firewall debe permitir el puerto `4000`.

---

## 7. Ejecutar en el navegador (PC)

```bash
cd client
npm run web
```

Se abre la aplicación en el navegador (pensada para **1920×1080**). Ingresar con
`admin@retenes.com` / `Admin123!`.

Para generar una versión web estática de producción:

```bash
npx expo export --platform web
# salida en client/dist/
```

---

## 8. Ejecutar en el teléfono (Expo Go)

1. Instalar **Expo Go** (Android/iOS) desde la tienda.
2. Con `client/.env` apuntando a la IP LAN de la PC, ejecutar:

   ```bash
   cd client
   npm start
   ```

3. Escanear el **código QR** con Expo Go (Android) o con la cámara (iOS).
4. Ingresar con un usuario de prueba.

---

## 9. Login social (OAuth): client ID/secret y redirect URIs

El sistema soporta login con **Google**, **Facebook** y **GitHub**. El flujo es:

1. La app (Expo) abre el proveedor y obtiene un **access token** del proveedor.
2. La app envía ese token al backend: `POST /api/v1/auth/social/:proveedor` con `{ accessToken }`.
3. El backend valida el token contra el proveedor y crea/actualiza el usuario.

Por eso las **credenciales (client ID/secret) se configuran en el proveedor y se usan desde la
app**, y las **URLs de redirección** deben incluir el esquema de la app y el entorno de desarrollo.

> El esquema de la app está definido en `client/app.json` como `"scheme": "retenesstock"`.
> El esquema de redirección de Expo Go para desarrollo es `exp://` con la IP/puerto del bundler.

### Google

1. Entrar a [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services →
   Credentials**.
2. Configurar la **pantalla de consentimiento OAuth** (tipo *External*, datos básicos).
3. **Create Credentials → OAuth client ID**. Tipo:
   - **Web application** para la versión Web (PC).
   - **Android** para el APK (requiere *package name* `com.retenesemic.stock` y la huella
     SHA-1 del keystore; EAS puede generarla con `eas credentials`).
4. En *Authorized redirect URIs* agregar:
   - `https://auth.expo.io/@<tu-usuario-expo>/retenes-stock`
   - `retenesstock://` (esquema propio de la app standalone)
5. Copiar el **Client ID** (y **Client Secret** si se usa flujo de servidor).

### Facebook

1. Entrar a [Meta for Developers](https://developers.facebook.com/) → **My Apps → Create App**
   (tipo *Consumer*).
2. Agregar el producto **Facebook Login**.
3. En **Settings → Basic** obtener **App ID** y **App Secret**.
4. En **Facebook Login → Settings**, en *Valid OAuth Redirect URIs* agregar:
   - `https://auth.expo.io/@<tu-usuario-expo>/retenes-stock`
   - `https://localhost:8081` (desarrollo web)

### GitHub

1. Entrar a [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
   → **New OAuth App**.
2. Completar **Homepage URL** (por ejemplo `http://localhost:8081`) y **Authorization callback
   URL**:
   - `https://auth.expo.io/@<tu-usuario-expo>/retenes-stock`
3. Generar un **Client Secret** y copiar **Client ID**.

### Variables en el backend

Completar en `.env` lo que se vaya a usar (el resto puede quedar vacío):

```ini
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OAUTH_CALLBACK_BASE_URL=http://localhost:4000
```

> Si un proveedor no está configurado, el botón de login social mostrará un aviso indicando que
> no está disponible. El login **email + contraseña** funciona sin ninguna configuración OAuth.

---

## 10. Verificación

Checklist rápido de que todo funciona:

1. **Backend:** `http://localhost:4000/health` responde `{ "ok": true }`.
2. **Login:** iniciar sesión con `admin@retenes.com` / `Admin123!`.
3. **Dashboard:** se ven los KPIs (total de productos ≈ 365).
4. **Productos:** el listado muestra el catálogo; filtros y paginación funcionan.
5. **Búsqueda por medidas:** buscar eje `30` con tolerancia `0.5` devuelve resultados.
6. **Movimientos:** registrar un ingreso y verificar que el stock aumenta.
7. **Roles:** ingresar como `vendedor@retenes.com` y comprobar que **no** aparecen Precios,
   Usuarios, Auditoría ni Configuración.

---

## 11. Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `Sin conexión a MySQL` en el arranque | Credenciales/servidor | Revisar `DB_*` en `.env` y que MySQL esté levantado |
| `Unknown database 'retenes_stock'` | Scripts no ejecutados | Ejecutar `SQL/01` … `06` en orden |
| Login devuelve `401` | Email/contraseña incorrectos o usuario inactivo | Verificar credenciales / activar el usuario |
| La app no carga datos en el teléfono | `EXPO_PUBLIC_API_URL` en `localhost` | Apuntar a la IP LAN de la PC y revisar firewall |
| `429 Too Many Requests` | Rate limit alcanzado | Esperar la ventana o ajustar `RATE_LIMIT_*` |
| El importador dice “archivo no encontrado” | Excel fuera de `imports/` | Copiar el `.xlsx` a `imports/` o usar `--file=` |
| Errores al ejecutar `05`/`06` en Workbench | `DELIMITER` | Ejecutar el archivo completo, no sentencias sueltas |

---

Con esto el sistema queda operativo en sus tres capas. Para generar el APK, ver
[`Guia_APK.md`](Guia_APK.md).
