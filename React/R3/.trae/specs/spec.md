# user-auth-system - Product Requirements Document

## Overview
- **Summary**: Aplicación educativa/demo que implementa DOS sistemas de autenticación y gestión de usuarios paralelos (Router y State) conectados a una misma base de datos SQL real mediante una API REST en Node.js/Express.
- **Purpose**: Servir como proyecto educativo que demuestra dos enfoques distintos de navegación frontend (React Router vs useState condicional) sobre la misma infraestructura backend, base de datos y API.
- **Target Users**: Estudiantes y desarrolladores que aprenden React, autenticación full stack, y comparan estrategias de routing.

## Goals
- G1: Backend Node.js/Express estable con MySQL, endpoints REST para registro, login, perfil, logout y actualización de usuario.
- G2: Sistema A ("router-system") con React Router v6, rutas /login, /register, /profile, /dashboard y protección de rutas.
- G3: Sistema B ("state-system") con navegación condicional por useState sin librería de routing, con vistas Login, Register, Profile, Dashboard.
- G4: Ambos sistemas usan la MISMA API, MISMA base de datos y el MISMO estado global de sesión (Context + localStorage), pero viven en carpetas separadas con lógica de vista independiente.
- G5: Formularios manejados exclusivamente con React Hook Form (useForm) con validación.
- G6: Estética minimalista, limpia y cálida; TailwindCSS + Bootstrap (solo grid/breakpoints, sin JS).
- G7: Estructura de carpetas por TIPO de archivo (no por feature), nombres en inglés, mayúscula inicial.

## Non-Goals
- NG1: No se implementan OAuth social (Google/GitHub/etc.) en este rediseño; solo autenticación email/password.
- NG2: No hay roles ni permisos complejos más allá de "usuario autenticado" vs "no autenticado".
- NG3: No hay tests automatizados unitarios/E2E como requisito obligatorio (sí compilación/build sin errores).
- NG4: No hay SSR, es Vite SPA pura.
- NG5: No cambia la estética visual más allá de limpiar y alinear al estilo minimalista cálido ya elegido.

## Background & Context
- Repositorio actual: `c:\Users\fedes\OneDrive\Documentos\GitHub\PDelSC\React\R3 y R5\`
- Stack existente que se conserva y refina:
  - Backend: Express + MySQL (mysql2) + bcrypt + jsonwebtoken + dotenv + cors + cookie-parser.
  - Frontend: Vite + React 18 + TailwindCSS + Bootstrap 5 + Axios + react-router-dom.
- Se agrega la dependencia obligatoria: `react-hook-form`.
- Estructura de carpetas actual se reorganiza para cumplir "por TIPO de archivo, mayúscula inicial, inglés".

## Functional Requirements

- **FR-1 (Registro de usuario)**:
  - Endpoint `POST /api/auth/register` que recibe email, username, display_name, password; hashea password; crea usuario en MySQL; devuelve 201 + {user, token}.
  - Validación server-side: email formato válido, único; password >= 6 chars; username único si se envía.
  - Frontend (ambos sistemas): formulario Register con React Hook Form, campos email, username (opcional), display_name, password + confirmación, mensajes de error inline.

- **FR-2 (Login)**:
  - Endpoint `POST /api/auth/login` con email + password; compara bcrypt; emite JWT HS256 con expiración; devuelve {user, token}.
  - Frontend: formulario Login con React Hook Form, email + password, error credenciales inválidas.

- **FR-3 (Obtener perfil propio)**:
  - Endpoint `GET /api/user/me` protegido por middleware `Authorization: Bearer <token>`; devuelve el usuario sin `password_hash`.
  - Si el token expira o es inválido responde 401.

- **FR-4 (Actualizar perfil)**:
  - Endpoint `PUT /api/user/me` protegido; acepta display_name, username, avatar_url (password opcionalmente); actualiza y devuelve usuario actualizado.
  - Si se envía `password` se re-hashea.
  - Frontend: formulario Edit Profile con React Hook Form dentro de Profile.

- **FR-5 (Logout)**:
  - Acción cliente-side: limpiar token de localStorage y estado global.
  - Backend puede no persistir logout (stateless JWT), pero se provee `POST /api/auth/logout` que responde 204 para simetría.

- **FR-6 (Sistema A - React Router)**:
  - Rutas: `/login`, `/register`, `/profile`, `/dashboard`, `*` (404).
  - `/profile` y `/dashboard` son protegidas: redirect a `/login` si no hay sesión.
  - `/login` y `/register` redirigen a `/dashboard` si ya está logueado.
  - Usa `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `Link`.

- **FR-7 (Sistema B - useState)**:
  - Un solo componente raíz con `const [view, setView] = useState('login'|'register'|'profile'|'dashboard'|'notfound')`.
  - Guards cliente-side equivalentes al router-system: sin sesión no entra a profile/dashboard, con sesión no se queda en login/register.
  - "Navegación" por callbacks `goTo(view)` + persistencia opcional de la última view en sessionStorage.

- **FR-8 (Estado global de sesión)**:
  - `AuthContext` expone `{ user, token, login(), register(), logout(), updateProfile(), loading, error }`.
  - `token` y `user` serializados en `localStorage` (clave `auth_token` / `auth_user`).
  - Al iniciar la app se hidrata desde localStorage y se valida contra `/api/user/me`.
  - Ambos sistemas consumen el MISMO `AuthContext` (no hay duplicados).

- **FR-9 (API Service)**:
  - Un solo módulo `Services/api.js` con instancia de Axios configurada con `baseURL`, interceptor que inyecta `Authorization: Bearer <token>` desde localStorage, y response-interceptor que limpia sesión en 401.

- **FR-10 (Dashboard)**:
  - Página/vista disponible solo autenticado. Muestra tarjeta de bienvenida con display_name, email, avatar; estadísticas mínimas (fecha de creación); link/botón a Profile.
  - Misma UI compartida en ambos sistemas (componente reutilizable).

- **FR-11 (404)**:
  - Vista/página 404 personalizada con botón para volver.

## Non-Functional Requirements

- **NFR-1 (Seguridad)**:
  - Passwords hasheados con bcrypt (cost >= 10).
  - JWT firmado con `JWT_SECRET` de `.env`; payload `{ sub: user.id }` + `exp`.
  - Helmet-like headers vía Express y CORS acotado al origen del frontend.
  - Nunca se devuelve `password_hash` en ninguna respuesta.

- **NFR-2 (Portabilidad)**:
  - Todo configurable vía `.env` (frontend y backend).
  - Script `schema.sql` idempotente con `CREATE DATABASE IF NOT EXISTS`, tablas con `DROP IF EXISTS + CREATE`, triggers para UUID.
  - Paths de import relativos, sin `@/alias` a menos que esté configurado en vite (se evita para máxima portabilidad).

- **NFR-3 (Performance)**:
  - Build de Vite sin warnings.
  - Axios con timeout 10s.
  - useState/useEffect usados con cuidado, rerenders innecesarios evitados.

- **NFR-4 (Consistencia visual)**:
  - Tailwind tokens de tema (colores, spacing, tipografía) centralizados.
  - Bootstrap solo importado para clases de grid/breakpoints (`grid` + `utilities`), no su JS ni componentes.
  - Tipografía, espaciado y centrado óptico uniformes en ambas vistas.

- **NFR-5 (UX)**:
  - Estados `loading` y `error` en todos los formularios.
  - Botones deshabilitados durante submit.
  - Feedback de éxito/error (toasts o alertas inline).

- **NFR-6 (Calidad de código)**:
  - ES Modules (`"type": "module"`), sin CommonJS.
  - Nombres en inglés, camelCase para variables/funciones, PascalCase para componentes/contextos.
  - Sin console.log de debug en commits finales; usar logger mínimo o middleware de error.

## Constraints

- **Technical**:
  - Frontend: Vite + React 18, NO CRA.
  - CSS: TailwindCSS configurado, Bootstrap 5 solo grid/breakpoints, NO componentes JS de Bootstrap.
  - Peticiones HTTP: Axios (no fetch); justificación: interceptores centralizados, manejo de errores homogéneo, cancelación, Timeout API uniforme.
  - Formularios: React Hook Form (useForm) para TODOS los forms; no Formik, no uncontrolled manuales.
  - Estado global: solo Context API (no Redux/Zustand).
  - Persistencia: localStorage para token/sesión.
  - DB: MySQL 8.0+ (se conserva la elección actual del repositorio).
  - Backend: Node.js + Express; rutas agrupadas por tipo en `Routes` (frente a `routes` actual, se normaliza mayúscula inicial).

- **Business/Estructura**:
  - Proyecto monorepo simple: `backend/` y `frontend/` como dos paquetes independientes con sus propios `package.json`.
  - Estructura POR TIPO de archivo (no por feature), mayúscula inicial, inglés. Ejemplo:
    ```
    frontend/src/
      Components/
        Atoms/
        Molecules/
        Organisms/
      Contexts/
      Hooks/
      Services/
      Utils/
      Styles/
      RouterSystem/
        Pages/
        ProtectedRoute.jsx
        index.jsx
      StateSystem/
        Screens/
        index.jsx
      App.jsx
      main.jsx
    backend/
      Config/
        db.js
        env.js
      Controllers/
      Middlewares/
      Routes/
      Services/
      server.js
      schema.sql
    ```
- **Dependencies**:
  - Añadir `react-hook-form` al `frontend/package.json`.
  - Mantener y validar: `axios`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `bootstrap`, `vite`, `@vitejs/plugin-react`.
  - Backend: mantener `express`, `mysql2`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `cookie-parser`.

## Assumptions

- A1: El usuario tiene MySQL 8.0+ corriendo localmente (o remoto) y podrá llenar el `.env` con credenciales.
- A2: Node.js >= 18 en ambos entornos.
- A3: Puerto backend por defecto 4000, frontend Vite por defecto 5173.
- A4: Bootstrap se importa solo la parte de CSS grid/utilities (no JS bundle); se excluye el JS de Bootstrap explícitamente.
- A5: UUIDs como `CHAR(36)` en la tabla `users` (igual que el schema actual, se conserva).
- A6: Sesión cliente-side con JWT en localStorage (no httpOnly cookie en este rediseño, para que ambos sistemas compartan exactamente la misma estrategia y sea visible educativamente).

## Open Questions

- [ ] ¿Se desea mantener los módulos de OAuth existentes o eliminarlos completamente? (En Non-Goals figuran excluidos del rediseño).
- [ ] ¿Avatar es solo URL textual o admite upload? (Se asume URL textual por simplicidad educativa).
- [ ] ¿Incluir un selector global (Navbar) para cambiar entre Sistema A y B sin editar .env, o se mantiene VITE_SYSTEM? (Se asume mantener VITE_SYSTEM para máxima independencia).

---

## Acceptance Criteria

### AC-1: Schema SQL idempotente crea tablas users y constraints
- **Type**: `rule`
- **Given**: Un servidor MySQL 8+ accesible con credenciales de root/admin
- **When**: Se ejecuta `source schema.sql` desde la CLI de MySQL o un cliente SQL
- **Then**: Se crea BD `auth_system`, tabla `users` con PK UUID, índices únicos sobre `email` y `username`, y los triggers para UUID están definidos
- **Pass Condition**: `SHOW TABLES` lista `users` y `DESCRIBE users` muestra todos los campos esperados; `SHOW INDEX FROM users` muestra UNIQUE en email/username
- **Evidence**: Archivo `backend/schema.sql` + output de los comandos SQL tras aplicarlo

### AC-2: Registro crea usuario en BD y devuelve JWT
- **Type**: `rule`
- **Given**: API corriendo, usuario `test@example.com` no existente, password `Pass1234`
- **When**: `POST /api/auth/register` con body `{ email: "test@example.com", display_name: "Test User", password: "Pass1234" }`
- **Then**: Respuesta 201, JSON contiene `{ ok: true, user: { id, email, display_name, ... }, token }`; no contiene `password_hash`
- **Pass Condition**: HTTP 201 + `token.length > 0` + `user.email === "test@example.com"` + `user.password_hash === undefined`
- **Evidence**: Request/response de curl o Postman; row creado en tabla `users` visible por SELECT

### AC-3: Login acepta credenciales válidas y rechaza inválidas
- **Type**: `rule`
- **Given**: Usuario `test@example.com` registrado con password `Pass1234`
- **When**: Se envía `POST /api/auth/login` con `{ email, password }` correctos; luego con password erróneo
- **Then**: Correcto -> 200 + token; erróneo -> 401 con mensaje legible
- **Pass Condition**: Ambos escenarios responden los códigos y cuerpos esperados
- **Evidence**: Dos llamadas HTTP con respuestas capturadas

### AC-4: GET /api/user/me requiere token válido
- **Type**: `rule`
- **Given**: Token JWT válido y otro token inválido/expirado
- **When**: `GET /api/user/me` con header `Authorization: Bearer <token>`
- **Then**: Válido -> 200 + usuario; inválido/sin header -> 401
- **Pass Condition**: Ambos casos responden como se espera; nunca se filtra `password_hash`
- **Evidence**: Request/response de ambos casos

### AC-5: PUT /api/user/me actualiza campos sin romper unicidad
- **Type**: `rule`
- **Given**: Usuario autenticado con token válido
- **When**: PUT con `{ display_name: "New Name" }` y luego PUT con `{ username: "duplicado" }` de un username ya usado
- **Then**: Caso 1 -> 200 + user actualizado; Caso 2 -> 409/400 con error de unicidad
- **Pass Condition**: `display_name` persistido en BD y error al violar unique
- **Evidence**: Respuestas HTTP + SELECT que muestra el cambio

### AC-6: Frontend compila con Vite sin errores ni warnings críticos
- **Type**: `rule`
- **Given**: Dependencias instaladas (`npm ci` o `npm install`) en `frontend/`
- **When**: `npm run build`
- **Then**: Exit code 0; dist/ generado
- **Pass Condition**: Build success, exit 0
- **Evidence**: Output de consola del comando build

### AC-7: react-hook-form gestiona Login, Register y Profile edit (3 forms)
- **Type**: `rule`
- **Given**: Ambos sistemas (Router y State) con sus vistas montadas en desarrollo
- **When**: Inspeccionar el código de los 3 formularios de cada sistema (o los componentes compartidos) y probar submit manualmente
- **Then**: Cada formulario usa `useForm` de `react-hook-form`; los `register`, `handleSubmit`, `formState.errors` están presentes; mensajes de error inline aparecen al intentar submit con campos vacíos o inválidos
- **Pass Condition**: 3/3 formularios usan useForm; errores inline renderizados; submit prevenido mientras hay errores
- **Evidence**: Snippets de código + captura de UI mostrando errores inline

### AC-8: AuthContext hidrata desde localStorage y protege rutas/vistas
- **Type**: `rule`
- **Given**: Login completado exitosamente en un sistema
- **When**: Se refresca la página (F5) y luego se intenta navegar manualmente a /profile sin hacer login de nuevo
- **Then**: El estado `user` y `token` se rehidratan desde localStorage; `/profile` sigue siendo accesible; se llama a `/api/user/me` para validar y refrescar el perfil
- **Pass Condition**: Sesión persiste tras refresh y la vista protegida carga sin redirect a login
- **Evidence**: DevTools Application > Local Storage + Network tab mostrando llamada a /me exitosa + UI de Profile

### AC-9: Sistema A (React Router) protege /profile y /dashboard
- **Type**: `rule`
- **Given**: `VITE_SYSTEM=router`, sin sesión iniciada
- **When**: Navegar a `http://localhost:5173/dashboard` y luego a `/profile`
- **Then**: Ambos redirect a `/login`; tras login exitoso, `/login` redirige a `/dashboard`
- **Pass Condition**: `window.location.pathname` refleja los redirects esperados
- **Evidence**: Navegación manual en browser + Network tab

### AC-10: Sistema B (useState) protege vistas Profile y Dashboard
- **Type**: `rule`
- **Given**: `VITE_SYSTEM=state`, sin sesión
- **When**: Intentar llamar `goTo('dashboard')` directamente desde consola o mediante flujo forzado
- **Then**: Guard bloquea la transición y deja la vista actual en login; tras login, goTo('login') redirige a dashboard
- **Pass Condition**: Estado `view` después de cada operación coincide con el esperado
- **Evidence**: Estado React visible en DevTools + UI final mostrada

### AC-11: Axios API singleton inyecta Bearer token y limpia sesión en 401
- **Type**: `rule`
- **Given**: Usuario con token válido y luego token manipulado/expirado
- **When**: Hacer cualquier llamada protegida a través del servicio API
- **Then**: Request contiene `Authorization: Bearer <token>`; si responde 401 el interceptor borra localStorage y desloguea al usuario
- **Pass Condition**: Headers request contienen Bearer; en 401 localStorage se limpia y estado vuelve a logged out
- **Evidence**: Network tab (headers) + estado tras 401 forzado

### AC-12: Estructura de carpetas por tipo, mayúscula inicial, inglés
- **Type**: `rule`
- **Given**: Repositorio tras rediseño
- **When**: Listar árbol `backend/` y `frontend/src/`
- **Then**: Coincide con el patrón definido en Constraints; no hay carpetas `components/` en minúsculas, ni `scripts/`, ni `styles/`; todas empiezan por mayúscula (`Components`, `Contexts`, `Hooks`, `Services`, `Utils`, `Styles`, `RouterSystem`, `StateSystem`, `Routes`, `Controllers`, `Middlewares`, etc.)
- **Pass Condition**: `ls` (o equivalente) muestra nombres PascalCase/Mayúscula inicial para carpetas de tipo y todas las rutas de import existentes funcionan (build AC-6 pasa)
- **Evidence**: Árbol de directorios + build exitoso

### AC-13: Tailwind + Bootstrap grid conviven sin conflictos visuales
- **Type**: `rubric`
- **Dimension**: Consistencia visual y compatibilidad de frameworks
- **Scale**: 1-5
- **Anchors**:
  - 1 = UI rota, clases col-* no funcionan, Tailwind sobreescribe Bootstrap o viceversa de forma visible
  - 3 = Funciona pero hay saltos de línea inesperados en breakpoints pequeños
  - 5 = Layouts fluidos, clases `container`, `row`, `col-*` de Bootstrap funcionan junto a `flex`, `gap-*`, etc. de Tailwind; breakpoints sm/md/lg/xl coherentes
- **Pass Threshold**: >= 4
- **Evidence**: Capturas de Login/Register/Profile/Dashboard en 3 tamaños (mobile md, md, xl)

### AC-14: Código idiomático, portátil y sin warnings de lint/typecheck donde aplique
- **Type**: `rubric`
- **Dimension**: Calidad y portabilidad del código
- **Scale**: 1-5
- **Anchors**:
  - 1 = imports rotos, paths absolutos hardcodeados, console.log de debug por todo lado
  - 3 = Funciona pero nombres mezclan idiomas, hay archivos sobrantes, .env.example incompleto
  - 5 = ES Modules consistentes; .env.example en ambos paquetes con todas las variables; nombres en inglés; sin console.log en producción; imports relativos portables
- **Pass Threshold**: >= 4
- **Evidence**: Revisión estática de archivos clave + salida de build/linters

### AC-15: Ambos sistemas (Router y State) tienen equivalencia funcional 1:1
- **Type**: `rubric`
- **Dimension**: Paridad entre sistemas
- **Scale**: 1-5
- **Anchors**:
  - 1 = Faltan pantallas en uno de los sistemas o no comparten AuthContext/API
  - 3 = Comparten API pero UI es distinta en componentes clave o falta protección
  - 5 = Mismos componentes organismo compartidos (LoginForm, RegisterForm, Profile, Dashboard); solo cambia la capa de navegación; misma protección en ambos
- **Pass Threshold**: >= 4
- **Evidence**: Comparación visual y de código entre RouterSystem/ y StateSystem/

### AC-16: UX mínima de formularios (loading, disabled, feedback error/éxito)
- **Type**: `rule`
- **Given**: Formulario Login/Register/Profile en desarrollo
- **When**: Clic en submit mientras la petición está en vuelo; luego respuesta exitosa; luego respuesta errónea
- **Then**: Botón `disabled` + spinner/texto "Cargando..." durante fetch; al éxito -> redirect o toast; al error -> mensaje visible debajo del botón o campo afectado
- **Pass Condition**: Los 3 estados (loading, ok, error) son observables
- **Evidence**: Capturas o gif mostrando los 3 estados
