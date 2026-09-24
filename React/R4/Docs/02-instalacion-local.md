# Instalación Local

Guía paso a paso para levantar el proyecto completo (frontend + backend + base de datos) en tu entorno local.

---

## 1. Prerrequisitos

Antes de empezar, asegurate de tener instalados en tu máquina:

| Software | Versión mínima | Cómo verificar |
|----------|----------------|----------------|
| **Node.js** | >= 18.x | `node -v` |
| **npm** (incluido con Node) | >= 9.x | `npm -v` |
| **PostgreSQL** | >= 14.x | `psql --version` o `pg_isready` |

> Si te falta PostgreSQL, descargalo desde [postgresql.org/download](https://www.postgresql.org/download/) y durante la instalación anotá el usuario/clave del superusuario `postgres`.

---

## 2. Clonar e instalar dependencias

```bash
# 1. Cloná el repositorio (o usá tu propio fork)
git clone LINK_REPOSITORIO_GIT
cd R4

# 2. Instalá todas las dependencias (producción + desarrollo)
npm install
```

Esto instalará:
- Backend: `express`, `cors`, `dotenv`, `pg`
- Frontend: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`
- Estilos/UI: `tailwindcss`, `postcss`, `autoprefixer`, `bootstrap` (solo grid)
- Animaciones: `framer-motion`

---

## 3. Configurar variables de entorno

```bash
# Copiá la plantilla a tu archivo .env local
# (Linux/Mac)
cp .env.example .env

# (Windows PowerShell)
Copy-Item .env.example .env
```

Abrí el archivo `.env` recién creado y completá las credenciales con las tuyas:

```dotenv
# --- Servidor Express ---
PORT=3001                                    # Puerto donde corre Express

# --- Base de datos PostgreSQL ---
DB_HOST=localhost                            # Host del motor PostgreSQL
DB_PORT=5432                                 # Puerto por defecto de PostgreSQL
DB_NAME=portfolio_db                         # Nombre que le darás a la BD
DB_USER=postgres                             # Tu usuario de PostgreSQL
DB_PASSWORD=tu_password_aqui                 # Tu password del usuario postgres

# --- Frontend (Vite) ---
# En desarrollo: Vite llama a la API por esta URL
# En producción monolítica: dejar "" para rutas relativas
VITE_API_BASE_URL=http://localhost:3001
```

> **IMPORTANTE:** El archivo `.env` NUNCA se sube al repositorio (ya está en `.gitignore`).

---

## 4. Crear la base de datos en PostgreSQL

Abrí una terminal y ejecutá la consola interactiva de PostgreSQL:

```bash
psql -U postgres
```

Dentro de `psql`, creá la base de datos y salí:

```sql
CREATE DATABASE portfolio_db;
\q
```

> Podés confirmar que se creó listando las BD con `\l` dentro de `psql`.

---

## 5. Ejecutar esquema y datos iniciales (seed)

Desde la carpeta raíz del proyecto (`R4/`), ejecutá primero el esquema y luego los datos iniciales:

```bash
# Opción A: psql CLI (recomendado)
psql -U postgres -d portfolio_db -f Database/schema.sql
psql -U postgres -d portfolio_db -f Database/seed.sql

# Opción B: si tu usuario no es postgres, reemplazá -U por tu usuario
psql -U TU_USUARIO -d portfolio_db -f Database/schema.sql
psql -U TU_USUARIO -d portfolio_db -f Database/seed.sql
```

Esto hará:
- `schema.sql`: dropea las tablas si existen y crea la estructura completa (5 tablas + índices).
- `seed.sql`: inserta registros de ejemplo para que el portfolio tenga contenido visible.

> Para reiniciar la BD a cero, volvé a correr ambos comandos.

---

## 6. Ejecutar en modo Desarrollo

El proyecto requiere **dos terminales abiertas en paralelo** (una para el frontend Vite, otra para el backend Express):

### Terminal 1 — Frontend (Vite, puerto 5173)
```bash
npm run dev
```
- Vite se levanta en `http://localhost:5173`
- Tiene Hot Module Replacement (HMR): los cambios en `.jsx/.css` se reflejan en caliente.
- Las llamadas a la API se resuelven usando `VITE_API_BASE_URL` del `.env`.

### Terminal 2 — Backend (Express, puerto 3001)
```bash
npm run server:dev
```
- El flag `--watch` reinicia Express automáticamente al detectar cambios en `server.js` o `/Routes/**/*.js`.
- La API queda disponible en `http://localhost:3001/api/*`.
- Los endpoints son:
  - `GET  /api/skills`
  - `GET  /api/projects`
  - `GET  /api/experiences`
  - `GET  /api/achievements`
  - `POST /api/messages`

Cuando ambos procesos estén corriendo, abrí `http://localhost:5173` en tu navegador.

---

## 7. Ejecutar en modo Producción (simulado localmente)

Para probar el build compilado como en Render/Railway:

```bash
# 1. Genera el build de Vite (compila el frontend en /dist)
npm run build

# 2. Levanta el servidor Express (que sirve /dist como contenido estático)
npm start
```

Ahora Express corre solo (puerto `3001` o el definido por `PORT`), y una única URL (`http://localhost:3001`) sirve tanto el frontend como la API. Esto es exactamente lo que hará Render en producción monolítica.
