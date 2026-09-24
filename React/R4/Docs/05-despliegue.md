# Despliegue a Producción

Se proponen dos estrategias de despliegue. Ambas son válidas y usan proveedores con capa gratuita. Elige una según tus preferencias:

- **Opción A — Render (monolítico):** todo (frontend + backend + PostgreSQL o externo) en un mismo servicio. Más simple, un solo repositorio, una sola URL.
- **Opción B — Vercel + Railway (separado):** frontend en Vercel, backend + PostgreSQL en Railway. Más modular, mejor escala por separado, dos URLs distintas.

---

## Opción A — Render (Arquitectura Monolítica)

Todo corre dentro de un único Web Service de Render:
1.  Render ejecuta `vite build` para generar el `dist/`.
2.  Luego levanta `server.js` con Node, que sirve `dist/` como contenido estático y también monta la API `/api/*`.
3.  El frontend accede a la API por **rutas relativas** (`/api/skills`) porque corren bajo el mismo dominio.

### 1. Preparar PostgreSQL

Elegí una de estas dos:

#### a) PostgreSQL gestionado por Render
- En Render, andá a **New → PostgreSQL**.
- Nombre: `portfolio-db`
- Region: la más cercana a tu público (ej: `Virginia (US East)`).
- Plan: Free / Starter.
- Creá la instancia y copiá sus credenciales (`Hostname`, `Port`, `Database`, `Username`, `Password`).

#### b) Supabase / Railway / ElephantSQL externo
- Podés usar cualquier proveedor: solo necesitás la connection string o los parámetros `DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD`.

### 2. Importar esquema + seed

Usando el `Hostname`, `User`, `Password` y `DB Name` del paso anterior, ejecutá **desde tu máquina local** contra la base de datos remota:

```bash
# Con psql (ajustá los valores)
psql -h HOSTNAME_RENDER -U USERNAME -d DBNAME -f Database/schema.sql
psql -h HOSTNAME_RENDER -U USERNAME -d DBNAME -f Database/seed.sql
```

(Te va a pedir el password de la BD remota.)

### 3. Crear el Web Service en Render

1.  Ir a **Render → New → Web Service**.
2.  Conectá tu repo de GitHub/GitLab que contiene la carpeta `R4/`.
3.  Completá la configuración:

| Campo | Valor |
|-------|-------|
| **Name** | `portfolio-personal` (o lo que quieras, se convierte en subdominio) |
| **Region** | Misma región que la BD (reduce latencia) |
| **Root Directory** | `R4` (si tu repo tiene el proyecto dentro de esta subcarpeta; si el repo ES el proyecto, dejalo vacío o `.`) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free (o Starter si querés dormir menos) |

### 4. Variables de Entorno (Render → Environment)

Agregá las siguientes variables (NO pongas `PORT`, Render lo inyecta automáticamente):

| Key | Value | ¿Por qué? |
|-----|-------|-----------|
| `NODE_VERSION` | `20` | Asegura Node >= 18. |
| `DB_HOST` | tu host remoto (ej: `dpg-xxxx…render.com`) | Host de PostgreSQL. |
| `DB_PORT` | `5432` | Puerto típico. |
| `DB_NAME` | nombre de tu BD | |
| `DB_USER` | usuario de la BD | |
| `DB_PASSWORD` | contraseña de la BD | |
| `VITE_API_BASE_URL` | `""` (dejalo **vacío**) | Al estar todo en el mismo dominio, el frontend usa rutas **relativas** (`fetch('/api/skills')`), sin necesidad de URL absoluta. Esto evita problemas de CORS y hardcoding. |

### 5. Deploy y testear

- Hacé click en **Create Web Service** y esperá el build.
- Cuando termine, Render te da una URL del tipo `https://portfolio-personal.onrender.com`.
- Abrila: la web debería cargar, las secciones pedir `/api/*` con éxito y el formulario de contacto insertar en `messages`.

> El plan Free de Render "duerme" la instancia tras 15 min sin tráfico. El primer request tarda ~10–30s en despertar.

---

## Opción B — Vercel (Frontend) + Railway (Backend + PostgreSQL)

Arquitectura separada:
- **Vercel:** solo compila y sirve el build de Vite (frontend estático).
- **Railway:** corre el servidor Express (solo la API `/api/*`) y opcionalmente provee la instancia PostgreSQL.
- El frontend llama al backend por **URL absoluta**.

### Bloque 1 — Railway (Backend + PostgreSQL)

#### 1. Provisionar PostgreSQL en Railway
1.  Railway → **New Project → Add a Service → PostgreSQL**.
2.  Entrá al servicio de DB → **Connect**, copiá las variables que necesitarás luego:
    - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` (o la Connection String completa).
3.  Desde tu máquina local, importá esquema y seed:
    ```bash
    psql -h PGHOST -U PGUSER -d PGDATABASE -f Database/schema.sql
    psql -h PGHOST -U PGUSER -d PGDATABASE -f Database/seed.sql
    ```

#### 2. Crear servicio Backend en Railway
1.  Railway → **New → GitHub Repo** (conectá el repo).
2.  Importante: si tu proyecto vive en subcarpeta `R4`:
    - Service → **Settings → Root Directory** → poné `R4`.
3.  Build Command: `npm install && npm run build` (necesitamos el `dist/` por ahora, aunque no lo usemos desde Railway si Vercel sirve el frontend — de todas formas `server.js` puede seguir sirviéndolo sin problemas).
4.  Start Command: `npm start`.
5.  Variables de entorno en Railway:

| Variable | Valor |
|----------|-------|
| `NODE_VERSION` | `20` |
| `PORT` | `$PORT` (Railway lo injecta; también podés poner `3001`, Railway mapea) |
| `DB_HOST` | tu `PGHOST` |
| `DB_PORT` | `5432` o tu `PGPORT` |
| `DB_NAME` | tu `PGDATABASE` |
| `DB_USER` | tu `PGUSER` |
| `DB_PASSWORD` | tu `PGPASSWORD` |
| `VITE_API_BASE_URL` | `""` |

6.  **Exponer el dominio público** de Railway: en el servicio → **Settings → Generate Domain**. Te quedará algo como `https://portfolio-backend-production.up.railway.app`. Guardalo, se lo pasamos a Vercel.

### Bloque 2 — Vercel (Frontend)

1.  Ir a **Vercel → Add New → Project** → conectar tu repo.
2.  **Framework Preset:** Vite debería detectarse solo. Si no, elegilo manualmente.
3.  **Root Directory:** `R4` (si aplica).
4.  Build Command: `npm run build`
5.  Output Directory: `dist`
6.  Variables de entorno (Project Settings → Environment Variables → Production):

| Variable | Valor | Nota |
|----------|-------|------|
| `VITE_API_BASE_URL` | `https://TU_DOMINIO_RAILWAY.railway.app` | **Sin barra al final**. El frontend concatena `/api/skills` a esta URL. |

> Importante: `VITE_*` es una variable de **build time**. Si la cambiás después, tenés que re-deployear Vercel (Redeploy) para que se inyecte en el JS compilado.

### 3. (Opcional) CORS en Express

Ya tenés `cors()` instalado sin restricciones en `server.js`. Si en producción querés limitarlo solo al dominio de Vercel, podés reemplazar en `server.js:23`:

```js
app.use(cors({
  origin: ['https://TU_FRONT_VERCEL.vercel.app']
}));
```

### 4. URLs finales

- **Frontend:** `https://tu-proyecto.vercel.app`
- **Backend API:** `https://tu-backend.up.railway.app/api/*`

El formulario de contacto de Vercel hará `POST https://tu-backend.up.railway.app/api/messages` y la respuesta será insertada en PostgreSQL de Railway.

---

## Resumen comparativo rápido

| Criterio | Opción A (Render monolítico) | Opción B (Vercel + Railway) |
|----------|------------------------------|-----------------------------|
| Cantidad de servicios | 1 Web Service | 2 servicios + 1 DB |
| Configuración | Más sencilla | Requiere variables cross |
| CORS | No aplica (mismo dominio) | Necesaria o abierta |
| URLs | Una sola | Front y back separadas |
| Escalado | Escalan juntos | Cada uno por separado |
| Despertar del free tier | Un solo servicio | 2 servicios pueden dormir |

Ambas opciones son válidas para la entrega. **Se recomienda la Opción A (Render)** si querés minimizar puntos de fallo y tiempo de configuración.
