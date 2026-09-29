# user-auth-system - Implementation Plan

## Task 1: Reorganizar estructura de carpetas Backend (por TIPO, mayúscula inicial)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Renombrar `Scripts/config/` → `Config/`
  - Renombrar `Scripts/controllers/` → `Controllers/`
  - Renombrar `Scripts/middlewares/` → `Middlewares/`
  - Renombrar `Scripts/routes/` → `Routes/`
  - Renombrar `Scripts/services/` → `Services/`
  - Eliminar carpeta `Scripts/` una vez vacía
  - Actualizar TODOS los imports relativos en `server.js` y cada archivo movido
  - Eliminar módulos OAuth (`oauthRoutes.js`, `Services/oauth/`, referencias) por NG1
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-1.1: `ls backend/` muestra `Config/ Controllers/ Middlewares/ Routes/ Services/ server.js schema.sql` y NO existe `Scripts/`
  - `rule` TR-1.2: `node --check server.js` y `node --check Config/*.js Controllers/*.js Middlewares/*.js Routes/*.js Services/*.js Services/**/*.js 2>nul; echo "EXIT=$LASTEXITCODE"` retorna EXIT=0 (sintaxis OK, imports resueltos)
- **Notes**: Elimina también oauthMiddleware si existe de referencias

---

## Task 2: Ajustar endpoints Backend (eliminar OAuth; afinar /auth y /user)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - `Routes/authRoutes.js`: mantener POST `/register`, POST `/login`, POST `/logout` (204). Eliminar endpoints OAuth.
  - `Routes/userRoutes.js`: GET `/me`, PUT `/me` (solo el usuario dueño del token). Eliminar rutas admin si existen.
  - `server.js`: quitar `import oauthRoutes` y el `app.use('/api/oauth', ...)`
  - `Middlewares/authMiddleware.js`: `requireAuth` que lee `Authorization: Bearer` y puebla `req.user`; `optionalAuth` existente si es necesario.
  - Validar que cualquier respuesta NUNCA incluya `password_hash`.
  - `POST /api/auth/logout` 204 vacío (sin body).
- **Acceptance Criteria Addressed**: FR-1, FR-2, FR-3, FR-4, FR-5, AC-2, AC-3, AC-4, AC-5, NFR-1
- **Test Requirements**:
  - `rule` TR-2.1: Levantar backend y hacer 4 curls que cubran AC-2 (register 201), AC-3 (login 200 + bad pass 401), AC-4 (me 200 + sin token 401), AC-5 (put ok + conflict). Todos pasan.
  - `rule` TR-2.2: Response body de `/register` y `/login` y `/me` NO contiene la cadena `password_hash` (grep -i negative en JSON).
  - `rule` TR-2.3: `POST /api/auth/logout` retorna HTTP 204 y body vacío.
- **Notes**: Usar variables BC_ROUNDS=10, JWT_EXPIRES_IN=1d en env

---

## Task 3: Asegurar schema.sql (limpiar tablas OAuth, mantener users + triggers)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Mantener DATABASE auth_system y tabla `users` igual que ahora (UUID triggers, unique email/username).
  - Quitar/Comentar `DROP TABLE refresh_tokens`, `DROP TABLE oauth_accounts`, las tablas `oauth_accounts` y `refresh_tokens`, y sus triggers para alinearse a NG1 (si luego se quiere volver, se deja una sección comentada marcada `-- [Opcional] OAuth + Refresh Tokens`).
  - Dejar schema 100% idempotente: `CREATE DATABASE IF NOT EXISTS`, `DROP TABLE IF EXISTS users`.
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-3.1: Ejecutar schema.sql dos veces seguidas (idempotencia). `SHOW TABLES` solo muestra `users` tras la segunda pasada (sin errores SQL).
  - `rule` TR-3.2: `DESCRIBE users` incluye los campos: id (PK CHAR36), email (UNIQUE), username (UNIQUE NULLABLE), password_hash (VARCHAR255), display_name, avatar_url, is_active, created_at, updated_at.
- **Notes**: Mantener triggers `tr_users_before_insert`

---

## Task 4: Reorganizar estructura de carpetas Frontend (por TIPO, mayúscula inicial)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - `src/Components/` (ya está bien). Internamente: `atoms/` → `Atoms/`, `molecules/` → `Molecules/`, `organisms/` → `Organisms/`
  - `src/Scripts/context/` → `src/Contexts/`
  - `src/Scripts/hooks/` → `src/Hooks/`
  - `src/Scripts/services/` → `src/Services/`
  - `src/Scripts/utils/` → `src/Utils/`
  - `src/Styles/` (ya está bien)
  - `src/router-system/` → `src/RouterSystem/`, su subcarpeta `pages/` → `Pages/`
  - `src/state-system/` → `src/StateSystem/`, su subcarpeta `screens/` → `Screens/`
  - Eliminar `src/Scripts/` una vez vacía
  - Actualizar todos los imports en `App.jsx`, `main.jsx`, `RouterSystem/index.jsx`, `StateSystem/index.jsx`, componentes y páginas.
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-4.1: `ls frontend/src/` muestra exactamente: `Components/ Contexts/ Hooks/ Services/ Utils/ Styles/ RouterSystem/ StateSystem/ App.jsx main.jsx` (además de public a nivel superior no importa).
  - `rule` TR-4.2: `ls frontend/src/Components/` muestra `Atoms/ Molecules/ Organisms/`; `ls frontend/src/RouterSystem/` muestra `Pages/ ProtectedRoute.jsx index.jsx`; `ls frontend/src/StateSystem/` muestra `Screens/ index.jsx`.
- **Notes**: No cambiar aún lógica interna, solo mover y reparar imports

---

## Task 5: Instalar react-hook-form y asegurar dependencias
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - `cd frontend && npm install react-hook-form --save`
  - Asegurar que `package.json` de frontend queda con `"react-hook-form": "^7.x"` en dependencies.
  - Backend: no requiere nuevas dependencias.
- **Acceptance Criteria Addressed**: FR (implícito), AC-7
- **Test Requirements**:
  - `rule` TR-5.1: `cat frontend/package.json | Select-String -Pattern '"react-hook-form"'` encuentra la línea en `dependencies`.
  - `rule` TR-5.2: `cd frontend && node -e "require.resolve('react-hook-form')"` (o equivalente con imports `node --input-type=module -e "import('react-hook-form').then(m=>console.log('ok',typeof m.useForm))"`) imprime `ok function`.
- **Notes**: Asegurar lockfile actualizado

---

## Task 6: Refactorizar Contexts/AuthContext + Services/api (Axios singleton + interceptor)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4, Task 5
- **Description**:
  - Crear/Simplificar `Services/api.js`: instancia `axios.create({ baseURL, timeout: 10000 })`.
    - Request interceptor: agrega `Authorization: Bearer <localStorage.auth_token>` si existe.
    - Response interceptor: si `401` limpia `localStorage.removeItem('auth_token')` y `removeItem('auth_user')`, dispara evento `auth:logout` o llama a un método del contexto para forzar logout.
  - `Contexts/AuthContext.jsx`:
    - Estado: `{ user, token, loading, error }`.
    - Efecto inicial: hidratar desde `localStorage.getItem('auth_token')` y `auth_user`, luego llamar `GET /api/user/me` para validar y actualizar `user` fresco. Si falla 401, limpiar.
    - Métodos expuestos: `login({email,password})`, `register({...})`, `updateProfile(payload)`, `logout()`.
    - Usa `Services/api.js` (no Axios directo).
  - Eliminar cualquier otra instancia de Axios duplicada en `authService.js` o similares; centralizar en `api.js`.
- **Acceptance Criteria Addressed**: FR-8, FR-9, AC-8, AC-11, NFR-2
- **Test Requirements**:
  - `rule` TR-6.1: Login en navegador devtools → localStorage keys `auth_token` y `auth_user` existen. F5 → estado se rehidrata y Network muestra `GET /api/user/me` 200.
  - `rule` TR-6.2: Modificar token por basura en localStorage, disparar una llamada protegida. Network devuelve 401 y luego localStorage queda vacío y estado vuelve a {user:null}.
  - `rubric` TR-6.3: Arquitectura del contexto; escala 1-5; 1 = API duplica Axios, 3 = Funciona pero sin interceptor 401, 5 = Interceptor centralizado, limpieza correcta, hidratación robusta; threshold >=4; evidencia: revisión de código api.js y AuthContext.jsx
- **Notes**: Usar nombres `VITE_API_BASE_URL` en .env.example de frontend

---

## Task 7: Crear/Refactorizar componentes de formularios compartidos con React Hook Form
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5, Task 6
- **Description**:
  - Crear 3 componentes en `Components/Organisms/` reutilizables por AMBOS sistemas:
    1. `LoginForm.jsx`: usa `useForm`, inputs email + password, validaciones: email requerido + patrón, password requerida. Submit llama `auth.login`.
    2. `RegisterForm.jsx`: campos email, display_name, username (opcional), password, confirmPassword. Validaciones: email válido, passwords coinciden, password >=6, display_name requerido. Submit llama `auth.register`.
    3. `ProfileForm.jsx`: campos display_name, username, avatar_url, password (opcional) y confirmPassword (condicional si password se llenó). Submit llama `auth.updateProfile`.
  - Cada formulario debe:
    - Usar `register()`, `handleSubmit()`, `formState.errors`, `formState.isSubmitting`.
    - Botón submit deshabilitado si `isSubmitting` con texto "Cargando...".
    - Errores inline rojos debajo de cada campo.
    - Un mensaje general de error (ex: credenciales inválidas) y de éxito cuando aplique (ej: toast o texto).
- **Acceptance Criteria Addressed**: AC-7, AC-16, NFR-5
- **Test Requirements**:
  - `rule` TR-7.1: Cada uno de los 3 forms contiene la llamada `useForm()` y usa `register + handleSubmit` (grep de código).
  - `rule` TR-7.2: Submit vacío en cada form NO envía petición (Network lo confirma) y renderiza mensajes de error inline.
  - `rule` TR-7.3: Durante submit el botón queda `disabled="disabled"` (o attribute disabled) y su texto es "Cargando...".
  - `rubric` TR-7.4: Experiencia formularios; escala 1-5; 1 = No hay disabled ni errores, 3 = Errores inline pero no disabled, 5 = loading + disabled + errores inline + mensaje global; threshold >=4; evidencia: capturas

---

## Task 8: Construir Sistema A (RouterSystem con React Router v6)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 6, Task 7
- **Description**:
  - `RouterSystem/index.jsx` envuelve en `<BrowserRouter>` o `<HashRouter>` (BrowserRouter preferido).
  - `RouterSystem/ProtectedRoute.jsx` wrapper: si no hay `user` → `<Navigate to="/login" replace />`.
  - Páginas en `RouterSystem/Pages/`:
    - `LoginPage.jsx` → renderiza `<LoginForm />`. Si `user` existe, `<Navigate to="/dashboard" replace />`. Incluye link a `/register`.
    - `RegisterPage.jsx` → `<RegisterForm />`, redirect a `/dashboard` si ya autenticado, link a `/login`.
    - `DashboardPage.jsx` → envuelta en `<ProtectedRoute>`; renderiza bienvenida, display_name, email, fecha creación, link/botón a `/profile`.
    - `ProfilePage.jsx` → envuelta en ProtectedRoute; renderiza `<ProfileForm />` más datos actuales.
    - `NotFoundPage.jsx` → 404 personalizada con link a Home (dashboard o login).
  - `Navbar` compartida (opcional) si se incluye debe estar dentro del Router.
- **Acceptance Criteria Addressed**: FR-6, AC-9, FR-10, FR-11
- **Test Requirements**:
  - `rule` TR-8.1: `VITE_SYSTEM=router`, sin sesión, navegar a `/dashboard` → termina en `/login`.
  - `rule` TR-8.2: Con sesión iniciada, navegar a `/login` → termina en `/dashboard`.
  - `rule` TR-8.3: Navegar a `/ruta-inexistente` → renderiza NotFoundPage (status visualmente).
  - `rule` TR-8.4: Las 4 páginas clave (login, register, profile, dashboard) renderizan sus componentes organismo esperados.
- **Notes**: Usar `Link`, `useNavigate` internamente

---

## Task 9: Construir Sistema B (StateSystem, navegación por useState)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 6, Task 7
- **Description**:
  - `StateSystem/index.jsx`:
    - `const [view, setView] = useState(defaultView)`; defaultView = si hay `user` → 'dashboard' sino 'login'.
    - Función `goTo(nextView)` con guards:
      - Si `nextView in {'profile','dashboard'}` y no hay user → quedarse en 'login' o llevar a 'login'.
      - Si `nextView in {'login','register'}` y ya hay user → forzar 'dashboard'.
      - Sino asignar `nextView`.
    - Renderiza la vista según `view`:
      - login → `<LoginScreen />`
      - register → `<RegisterScreen />`
      - dashboard → `<DashboardScreen />`
      - profile → `<ProfileScreen />`
      - default → `<NotFoundScreen />`
    - Pasa `goTo` a cada screen via props o via contexto ligero (mejor props para simplicidad).
  - `Screens/` (5 archivos): LoginScreen, RegisterScreen, DashboardScreen, ProfileScreen, NotFoundScreen. Cada uno renderiza el organismo compartido correspondiente (LoginForm, etc.) y botones/links textuales que llaman `goTo(...)` en vez de `<Link>`.
  - Persistir `view` en `sessionStorage.setItem('ss_view', view)` y al hidratar leerlo como hint (pero sin ignorar guards).
- **Acceptance Criteria Addressed**: FR-7, AC-10, FR-10, FR-11
- **Test Requirements**:
  - `rule` TR-9.1: `VITE_SYSTEM=state`, sin sesión, forzar `goTo('dashboard')` desde consola → view se mantiene en `login` (React DevTools).
  - `rule` TR-9.2: Con sesión, `goTo('login')` → view se convierte a `dashboard`.
  - `rule` TR-9.3: `goTo('ruta-inexistente')` → renderiza NotFoundScreen.
  - `rubric` TR-9.4: Paridad visual con Sistema A; escala 1-5; 1 = UI distinta, 3 = Casi igual pero faltan enlaces, 5 = Mismos textos, misma disposición, solo cambia la forma de navegar; threshold >=4; evidencia: capturas lado a lado
- **Notes**: SessionStorage con clave `ss_view`

---

## Task 10: Estilos, Tailwind + Bootstrap grid (sin JS) y uniformidad visual
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4, Task 7, Task 8, Task 9
- **Description**:
  - `Styles/index.css`: directivas Tailwind (`@tailwind base/components/utilities`) y `@import 'bootstrap/dist/css/bootstrap-grid.min.css'` (solo GRID). NO importar `bootstrap.min.css` completo para evitar conflictos de componentes/JS.
  - `tailwind.config.js`: definir `theme.extend.colors` (paleta cálida minimalista: fondo suave, primario #d97706 tipo amber-600 o similar, texto oscuro) y tipografía.
  - Revisar `postcss.config.js` (debe incluir tailwind + autoprefixer).
  - Asegurar que Login/Register tengan layout centrado vertical y horizontal con `min-h-screen flex items-center justify-center` y card con sombra suave.
  - Dashboard y Profile usan `container` (Bootstrap) + `max-w-4xl mx-auto` (Tailwind) para alineación óptica.
- **Acceptance Criteria Addressed**: AC-13, NFR-4, NFR-5
- **Test Requirements**:
  - `rule` TR-10.1: Build de frontend (Task 11) incluye CSS combinado y NO hay errores de PostCSS/Tailwind en consola.
  - `rule` TR-10.2: En `main.jsx` NO existe `import 'bootstrap/dist/js/bootstrap.bundle.min.js'` ni import de JS Bootstrap.
  - `rubric` TR-10.3: Uniformidad visual; escala 1-5; threshold >=4; evidencia: capturas en 3 resoluciones (<640, 768, >=1280) mostrando layout correcto
- **Notes**: Alinear cards, inputs y botones a 12-column grid cuando aplique

---

## Task 11: Build y lint sin errores (Frontend + Backend smoke tests)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-10
- **Description**:
  - `cd frontend && npm run build` → exit 0, warnings mínimos aceptables (ninguno de imports sin usar).
  - `cd backend && node --check server.js && node --check Config/*.js Controllers/*.js Middlewares/*.js Routes/*.js Services/*.js Services/**/*.js` → exit 0.
  - Frontend: si hay ESLint disponible correr, sino solo build.
  - Actualizar `.env.example` en ambos paquetes para reflejar nuevas variables:
    - Backend: PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN, BCRYPT_ROUNDS
    - Frontend: VITE_API_BASE_URL, VITE_SYSTEM (router|state)
- **Acceptance Criteria Addressed**: AC-6, AC-12, AC-14, NFR-2
- **Test Requirements**:
  - `rule` TR-11.1: `npm run build` frontend retorna exit code 0.
  - `rule` TR-11.2: Todos los archivos JS/JSX de backend pasan `node --check`.
  - `rule` TR-11.3: Ambos `.env.example` contienen las variables documentadas arriba (grep para cada clave).
  - `rubric` TR-11.4: Portabilidad/Calidad general código; escala 1-5; threshold >=4; evidencia: revisión estática + build outputs
- **Notes**: Limpiar cualquier warning de Vite sobre imports no usados

---

## Task 12: App.jsx selector de sistema y main.jsx limpio
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8, Task 9
- **Description**:
  - `App.jsx`: wrappea todos los Providers (Theme* se elimina si NG3 lo prefiere, o se mantiene Notification/Auth), manteniendo selección de sistema por `VITE_SYSTEM`:
    - Sistema A: `<RouterSystem />`
    - Sistema B: `<StateSystem />`
  - Si hay `NotificationContainer` mantener como parte de UX; si no, se puede re-utilizar o eliminar (notificaciones inline son aceptables para no ampliar scope).
  - `main.jsx`: `createRoot(...).render(<App />)` limpio, sin providers duplicados.
- **Acceptance Criteria Addressed**: G2, G3, AC-15
- **Test Requirements**:
  - `rule` TR-12.1: Con `VITE_SYSTEM=router` la UI de RouterSystem se monta (barra de location cambia). Con `VITE_SYSTEM=state` NO hay BrowserRouter (verificar que location no cambia entre vistas).
  - `rubric` TR-12.2: Paridad funcional; escala 1-5; threshold >=4; evidencia: Checklist manual de 5 flujos iguales en ambos sistemas (register, login, go dashboard, edit profile, logout) todos pasan en ambos
- **Notes**: Por defecto `VITE_SYSTEM=router`

---

## Task 13: Verificación cruzada de ACs (manual smoke end-to-end)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 11, Task 12
- **Description**:
  - Checklist manual completo:
    1. Aplicar schema.sql en MySQL fresco → base OK
    2. Levantar backend `npm run dev`
    3. curl register → user + token (AC-2)
    4. curl login + bad login (AC-3)
    5. curl me con/sin token (AC-4)
    6. curl put me (AC-5)
    7. Frontend RouterSystem (VITE_SYSTEM=router):
       - Redirect anónimo /dashboard → /login (AC-9)
       - Registro y login UI
       - Profile edit actualiza DB
       - Logout limpia localStorage
       - Refresh (F5) conserva sesión (AC-8)
       - API interceptor 401 limpia (AC-11)
       - 404
    8. Frontend StateSystem (VITE_SYSTEM=state):
       - Repetir flujos con guards useState (AC-10)
       - Paridad visual/funcional vs Router (AC-15)
    9. 3 formularios usan RHF y tienen loading/error (AC-7, AC-16)
    10. Build frontend OK (AC-6)
- **Acceptance Criteria Addressed**: ALL ACs (1-16)
- **Test Requirements**:
  - `rule` TR-13.1: Los 10 pasos del checklist se completan con resultado esperado.
  - `rubric` TR-13.2: Cumplimiento global de Acceptance Criteria; escala 1-5; 1 = menos de 8 ACs cumplen, 3 = 10/16, 5 = 15+/16; threshold >=4; evidencia: Notas del checklist con resultados
- **Notes**: Si un AC falla, abrir Issue correspondiente antes de cerrar tarea
