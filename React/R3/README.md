# AuthDual — Sistema de Autenticación Dual (Router / useState)

Full-stack auth template con **React + Vite** en el frontend y **Node.js + Express + MySQL** en el backend.

El repo implementa **dos arquitecturas de navegación y control de acceso** que conviven dentro del mismo proyecto y comparten toda la lógica de negocio (Context API, hooks, servicios Axios, componentes compartidos, OAuth):

| Sistema | Carpeta | Control de acceso | Tipo |
|---|---|---|---|
| **A — React Router** | `frontend/src/router-system/` | HOC `<ProtectedRoute />` + `<Navigate to="/login" />` | Browser router v6 |
| **B — useState**     | `frontend/src/state-system/`  | Renderizado condicional según `AuthContext.authenticated` | Switch por `useState()` |

El objetivo es comparar ambas estrategias de control de acceso **con exactamente el mismo backend y componentes de UI**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos  | TailwindCSS (tokens de paleta otoñal) + **Bootstrap 5 (Reboot / Grid / Utilities)** |
| Router A | React Router v6 (`BrowserRouter`, `Routes`, `Navigate`) |
| Router B | `useState` puro + `window.history` simulado |
| Backend  | Node.js + Express 4 |
| Base de datos | **MySQL 8** (driver `mysql2/promise` — prepared statements) |
| HTTP client | Axios (único cliente, interceptores de refresh token) |
| Passwords | bcrypt (12 rounds) — NUNCA se almacenan en claro |
| Sesiones | JWT access token (memoria JS, 15 min) + refresh token (cookie `httpOnly`, 7 días, con rotación server-side en DB) |
| OAuth2 | Google, Meta/Facebook, GitHub, X (Twitter), Discord, Twitch (redirect flow) |

---

## Requisitos previos

- Node.js **≥ 18**
- MySQL **≥ 8**
- Un cliente SQL (Workbench, DBeaver, `mysql` CLI) para importar `backend/schema.sql`
- Credenciales OAuth (ver `AUTH_PROVIDERS.md`)

---

## Instalación

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env          # editá las credenciales de MySQL y las de OAuth

# 2) Importar schema MySQL
mysql -u root -p < schema.sql # crea la base `auth_system` y sus tablas

# 3) Frontend
cd ../frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api ; VITE_SYSTEM=router|state
```

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Ejemplo | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | Entorno |
| `PORT` | `5000` | Puerto Express |
| `FRONTEND_URL` | `http://localhost:5173` | Origen permitido por CORS + redirect OAuth |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `localhost / 3306 / root / ... / auth_system` | Credenciales MySQL |
| `ACCESS_TOKEN_SECRET` | string largo random | Firma JWT access |
| `REFRESH_TOKEN_SECRET` | string largo random DISTINTO | Firma/rotación RT |
| `ACCESS_TOKEN_EXPIRES_IN` | `15m` | Duración access token |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Duración refresh token |
| `{PROVEEDOR}_CLIENT_ID`, `{PROVEEDOR}_CLIENT_SECRET`, `{PROVEEDOR}_CALLBACK_URL` | — | Una tupla por proveedor OAuth (Google/Meta/GitHub/Twitter/Discord/Twitch). El callback apunta a `http://localhost:5000/api/oauth/{provider}/callback`. Ver `AUTH_PROVIDERS.md`. |

### Frontend (`frontend/.env`)

| Variable | Valores | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | URL base del backend API |
| `VITE_SYSTEM` | `router` \| `state` | **Elige Sistema A (Router) o Sistema B (useState)** |

Para cambiar de sistema sin tocar código: basta con cambiar `VITE_SYSTEM` y reiniciar `npm run dev`.

---

## Cómo correr el proyecto

```bash
# Terminal 1 — backend
cd backend
npm run dev   # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev   # http://localhost:5173
```

Para compilar el frontend para producción: `cd frontend && npm run build && npm run preview`.

---

## Endpoints del backend

Base: `http://localhost:5000/api`

| Método | Path | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Crea usuario email/pwd. Emite access_token + RT cookie. |
| POST | `/auth/login` | No | Login email/pwd. Emite tokens. |
| POST | `/auth/refresh` | Cookie RT | Rota el refresh token y devuelve un nuevo AT. |
| POST | `/auth/logout` | Cookie RT | Revoca el RT del dispositivo actual. |
| POST | `/auth/logout-all` | Requiere AT | Revoca TODOS los RT del usuario. |
| GET | `/user/me` | Requiere AT | Perfil completo + cuentas OAuth enlazadas. |
| PATCH | `/user/me` | Requiere AT | Editar `displayName`, `username`. |
| POST | `/user/change-password` | Requiere AT | Cambiar contraseña. |
| GET | `/oauth/providers` | No | Lista proveedores OAuth configurados. |
| GET | `/oauth/:provider?redirect=/dashboard` | No | Inicia redirect OAuth. `redirect` es la ruta del frontend a la que volver. |
| GET | `/oauth/:provider/callback` | No | Callback del proveedor; redirige al frontend y entrega tokens. |

Todas las mutaciones usan **prepared statements** (`mysql2` `pool.execute`) — riesgo de **SQL Injection = 0**.

---

## Estrategia de tokens y seguridad

| Elemento | Almacenamiento | Justificación |
|---|---|---|
| Access Token JWT (15 min) | **Memoria JS** (`window.__at__`) | Nunca en `localStorage` → minimiza el impacto de un XSS. |
| Refresh Token (7 días) | **Cookie `httpOnly + SameSite=Lax + Secure`** | Invisible para JS; el navegador la envía automáticamente al endpoint `/auth/refresh`. |
| Tema claro/oscuro | `localStorage` | Dato no sensible. |

### Trade-off: cookies httpOnly vs localStorage

| Estrategia | XSS | CSRF | Portabilidad cross-domain |
|---|---|---|---|
| `localStorage` (AT + RT) | ❌ Fácil robo | ✅ No aplica | ✅ Mejor (si frontend/backend están en dominios distintos) |
| **`httpOnly` cookies (solo RT) + AT en memoria** | ✅ RT imposible de leer | Mitigado con `SameSite=Lax` + state nonce en OAuth | ⚠️ Exige `credentials: 'include'` + CORS bien configurado |

Este proyecto elige la **segunda estrategia** por ser la recomendación industrial actual. El único costo es que ambos servicios deben correr en el **mismo eTLD+1** en producción o usar CORS con `credentials: true` en dev (ya configurado).

Adicionalmente:

- **Rotación de refresh tokens** — cada `/refresh` invalida el token usado y emite uno nuevo.
- **Reuse detection** — si el mismo RT se consume dos veces, se revocan TODOS los tokens del usuario (ataque sospechado).
- **Tabla `refresh_tokens`** — revocación server-side total o por dispositivo (logout global vs parcial).

---

## Diferencias entre Sistema A y Sistema B

### Sistema A · `router-system/` (React Router v6)
- Usa `BrowserRouter`, `Routes`, `Route`.
- Ruta `/dashboard` y `/profile` **envueltas en `<ProtectedRoute>`**.
- Si el usuario no está logueado → `<Navigate to="/login" replace state={{ from }} />` (luego regresa automáticamente a la ruta intentada).
- Ideal para apps de tamaño mediano/grande, URLs compartibles, bookmarks, history nativo.

### Sistema B · `state-system/` (useState puro)
- Sin librería. El estado `screenKey` decide qué pantalla renderizar.
- Protección por **renderizado condicional** dentro del archivo `index.jsx` (`PRIVATE_SCREENS`).
- Se sincroniza con `window.history.pushState / replaceState` para imitar URLs navegables.
- Ideal para entornos donde no se quiere la dependencia de `react-router-dom`, flujos cerrados (wizards), microfrontends.

### ¿Qué compartem os entre ambos?
- `AuthContext`, `ThemeContext`, `NotificationContext`
- `useForm`, `useAuth`, `useTheme`, `useNotification`
- `api.js` (Axios + refresh auto + interceptor 401)
- `authService.js`
- Todos los componentes `Components/` (átomos, moléculas, organismos)
- Paleta otoñal, tipografía, estilos base.

La **única diferencia** es el directorio `router-system/` vs `state-system/` y el switch en `App.jsx`.

---

## Arquitectura de carpetas

```
/backend
  server.js
  package.json
  schema.sql              (DDL MySQL)
  Scripts/
    config/   → db.js (pool mysql2), env.js
    controllers/ → auth, user
    routes/   → authRoutes, userRoutes, oauthRoutes
    middlewares/ → auth, cors, error
    services/ → jwtService, passwordService, validationService
                oauth/{google,meta,github,twitter,discord,twitch}OAuth.js

/frontend
  package.json / vite.config.js / tailwind.config.js / postcss.config.js
  public/favicon.svg
  src/
    main.jsx  (bootstrap reboot/grid/utilities + Tailwind)
    App.jsx   (Providers + switch Sistema A/B)
    Scripts/
      hooks/     → useForm, useAuth, useTheme, useNotification
      context/   → AuthContext, ThemeContext, NotificationContext
      services/  → api.js (Axios), authService.js
      utils/     → validators.js, helpers.js
    router-system/   Sistema A (React Router)
    state-system/    Sistema B (useState puro)
    Components/
      atoms/     → Button, Input, Label, Icon, ToggleTheme
      molecules/ → FormField, SocialLoginButton, Modal, Toast
      organisms/ → LoginForm, RegisterForm, Navbar, Dashboard, Profile, NotificationContainer
    Styles/
      themes/tokens.css   (paleta otoñal light/dark)
      base/                reset + tipografía
      index.css            Tailwind + componentes utilitarios
    Assets/                (íconos SVG inline — no assets externos)
```

---

## Paleta otoñal (modo claro / oscuro)

Los tokens se definen en `frontend/src/Styles/themes/tokens.css` y Tailwind los consume via `var(...)`:

| Token | Light | Dark |
|---|---|---|
| `--bg-primary` | Beige cálido | Marrón oscuro |
| `--accent-primary` | **Terracota** #B85C38 | Terracota brillante #E07A50 |
| `--accent-secondary` | Mostaza | Mostaza clara |
| `--accent-tertiary` | Verde oliva | Verde oliva claro |
| `--accent-success / error / warning` | Oliva / Teja / Ocre | (versiones brillantes dark) |

No hay colores saturados ni neón. Los gradientes usan `accent-primary → accent-secondary`.

---

## Testing rápido (smoke test)

1. Corré backend + frontend.
2. Andá a `http://localhost:5173/register` y creá un usuario.
3. Al ser redirigido a `/dashboard`, ver las stats del perfil y el listado vacío de OAuth.
4. Refrescá la página: el auto-login silencioso via `/refresh` debe restaurar la sesión.
5. Probá **cambiar al Sistema B**: edita `VITE_SYSTEM=state` en `frontend/.env`, reinicia vite, verificá que el flujo sea idéntico.

---

## Licencia

Template educativo / boilerplate.
