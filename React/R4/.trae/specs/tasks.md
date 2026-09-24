# Portfolio Personal (React + Tailwind + SQL) — Implementation Plan

## Task 1: Inicializar estructura de carpetas y archivos base (package.json, .env.example)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Crear todas las carpetas obligatorias: Scripts, Components, Styles, Assets, Database, Routes, Docs.
  - Inicializar `package.json` raíz con `type: module` (ESM) y dependencias base (express, pg, cors, dotenv + devDeps: vite, react, react-dom, tailwindcss, postcss, autoprefixer, bootstrap, framer-motion).
  - Crear `.env.example` con variables `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `VITE_API_BASE_URL`.
  - Crear `package-lock.json` placeholder (se genera con `npm install`, pero anotar en TR que se debe correr).
- **Acceptance Criteria Addressed**: AC-1, AC-12
- **Test Requirements**:
  - `rule` TR-1.1: Ejecutar `LS` en raíz y verificar presencia de las 7 carpetas, `package.json`, `.env.example`. Evidence: listado de directorio.
  - `rule` TR-1.2: `package.json` contiene `"type": "module"` y las dependencias listadas en `dependencies`/`devDependencies`. Evidence: `Read` del archivo.
  - `rule` TR-1.3: `.env.example` declara las 7 variables de entorno sin valores reales. Evidence: `Read` del archivo.

## Task 2: Configurar build y estilos (Vite + Tailwind + Bootstrap grid + Framer Motion)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Instalar dependencias (npm install) y generar `package-lock.json` real.
  - Crear `vite.config.js` (o `vite.config.mjs`) con proxy a Express en dev y build output en `/dist`.
  - Configurar `tailwind.config.js` con:
    - Modo `darkMode: 'class'`
    - Colores custom (paleta otoñal): cream `#F5EFE6`, terracotta `#C97B4C`, olive `#7C8B6C`, softBrown `#6B4F3B`, deepBrown `#2B211B`, burntOrange `#B5651D`, mustard `#C9A24B`, mutedBeige `#A69783`.
    - Content apuntando a `./index.html`, `./Components/**/*.{js,jsx}`, `./Scripts/**/*.{js,jsx}`.
  - Crear `postcss.config.js` y archivos en `/Styles`: `index.css` (con `@tailwind base/components/utilities;` + CSS base tipografía), `theme.css` (variables CSS fallback si fuera necesario).
  - Importar solo `bootstrap/dist/css/bootstrap-grid.min.css` (no el bundle completo) desde `Styles/index.css` o Vite entry.
  - Crear `index.html` raíz con entry `#root` y `<script type="module" src="/Scripts/main.jsx">`.
- **Acceptance Criteria Addressed**: AC-1, AC-7, AC-10, AC-13
- **Test Requirements**:
  - `rule` TR-2.1: `npm install` corre sin errores y genera `node_modules/` y `package-lock.json`. Evidence: salida de consola.
  - `rule` TR-2.2: `tailwind.config.js` define `darkMode: 'class'` y los 8 colores de la paleta. Evidence: `Read` del config.
  - `rule` TR-2.3: En `Styles/index.css` no se importa más que la grilla de Bootstrap (no bootstrap.min.css). Evidence: grep sobre el CSS.
  - `rule` TR-2.4: Comando `npx vite build` compila exitosamente a `/dist`. Evidence: salida de consola.

## Task 3: Crear esquema y seed SQL (PostgreSQL)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - `Database/schema.sql`:
    - Tabla `skills` (id PK, name, level 0-100, category, icon_name, created_at).
    - Tabla `projects` (id PK, title, description, repo_url, demo_url, image_url, tags TEXT[], featured BOOL, created_at).
    - Tabla `experiences` (id PK, company, role, start_date, end_date, location, description, created_at).
    - Tabla `achievements` (id PK, title, issuer, date_earned, description, certificate_url, created_at).
    - Tabla `messages` (id PK, name, email, body, read BOOL DEFAULT false, created_at).
    - Índices únicos donde aplique y constraints NOT NULL básicas.
  - `Database/seed.sql`:
    - Insertar 5 skills (placeholder `[Skill 1]`, etc.) con categorías "Frontend", "Backend", "Tools".
    - Insertar 4 projects (placeholder `[Tu proyecto 1]`, etc.) con tags y URLs placeholder.
    - Insertar 3 experiences (placeholder `[Empresa 1]`, etc.) con fechas y descripciones.
    - Insertar 3 achievements (placeholder `[Certificación 1]`, etc.).
    - No insertar mensajes en seed (la tabla se llena por el form).
  - `Database/connection.js`:
    - Módulo ESM que exporta un `Pool` de `pg` configurado con variables de entorno, reutilizable por las rutas.
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-13
- **Test Requirements**:
  - `rule` TR-3.1: Ejecutados schema.sql + seed.sql en BD vacía devuelven 0 errores. Evidence: salida psql.
  - `rule` TR-3.2: `SELECT count(*) FROM skills/projects/experiences/achievements` retorna >= 3 cada una. Evidence: salida psql.
  - `rule` TR-3.3: `Database/connection.js` usa `import pg from 'pg'` y exporta pool usando `process.env.*`, sin credenciales hardcodeadas. Evidence: `Read` del archivo.

## Task 4: Implementar backend Express (server.js + routers)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - `server.js` en raíz:
    - Carga `dotenv/config`, habilita CORS, JSON parsing, sirve contenido estático de `dist/` (fallback a index.html para SPA).
    - Monta routers `/api/skills`, `/api/projects`, `/api/experiences`, `/api/achievements`, `/api/messages`.
    - Ruta catch-all `*` devuelve `dist/index.html` cuando exista; en desarrollo al menos levanta el servidor en `process.env.PORT || 3001`.
  - Routers en `/Routes`:
    - `skills.js`: GET / (listar todas, orden por categoría/name).
    - `projects.js`: GET / (listar, featured primero); GET /:id (detalle opcional).
    - `experiences.js`: GET / (orden por start_date DESC).
    - `achievements.js`: GET / (orden por date_earned DESC).
    - `messages.js`: POST / (insertar; validar name, email, body no vacíos y email con regex básica; sanitizar; devolver 201 con id o 400 con errores).
  - Cada router importa `pool` desde `Database/connection.js`.
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-9
- **Test Requirements**:
  - `rule` TR-4.1: `node server.js` inicia sin crash en el puerto configurado. Evidence: log "Server running on port X".
  - `rule` TR-4.2: `curl http://localhost:<port>/api/skills` retorna 200 JSON con al menos 5 registros; igual para projects, experiences, achievements. Evidence: salida curl.
  - `rule` TR-4.3: `curl -X POST /api/messages` con `{name,email,body}` válido → 201 + nuevo registro en `SELECT * FROM messages ORDER BY id DESC LIMIT 1`. Evidence: salida curl + SELECT.
  - `rule` TR-4.4: POST con email inválido → 400, sin insertar fila. Evidence: idem.
  - `rule` TR-4.5: Ningún router, server.js ni connection.js usa `require()`. Evidence: grep `require(` en Routes/ + raíz JS (excepto si `type: module` + imports everywhere).

## Task 5: Crear hooks custom, contextos y utilidades (carpeta Scripts/)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - `Scripts/ThemeContext.jsx`:
    - Context + Provider con estado `theme` ('light'|'dark'), inicializado desde `localStorage.getItem('theme')` o `'light'`.
    - Función `toggleTheme` que guarda en localStorage y añade/quita la clase `dark` en `<html>`.
    - Tema persistente al recargar.
  - `Scripts/useApiData.js` (custom hook):
    - `useApiData(endpoint)` que devuelve `{data, loading, error}` usando `useEffect` + `fetch` a `import.meta.env.VITE_API_BASE_URL + endpoint`.
    - Manejo de errores y loading state.
  - `Scripts/useScrollSpy.js` (custom hook):
    - Recibe array de IDs de secciones, retorna el ID activo basado en scroll position + IntersectionObserver o listener `scroll` y `getBoundingClientRect`.
  - `Scripts/apiClient.js`:
    - Helper `get(endpoint)` y `post(endpoint, body)` centralizados con headers JSON y manejo base de errores.
  - `Scripts/utils.js`:
    - Validadores: `validateEmail`, `validateNotEmpty`, helpers de formato.
  - `Scripts/main.jsx`:
    - Entry point: `createRoot(document.getElementById('root')).render(<ThemeProvider><Portfolio/></ThemeProvider>)`.
- **Acceptance Criteria Addressed**: AC-6 (parcial), AC-7, AC-11, AC-13, FR-5
- **Test Requirements**:
  - `rule` TR-5.1: Archivos creados en Scripts/ listados arriba. Evidence: LS Scripts/.
  - `rule` TR-5.2: Al montar `<ThemeProvider>` por primera vez se lee localStorage y al llamar `toggleTheme` se persiste y cambia clase `dark` en `<html>`. Evidence: inspección DevTools.
  - `rule` TR-5.3: `useApiData('/api/skills')` dispara un fetch exitoso y devuelve `data` con array. Evidence: test rápido en componente dummy.
  - `rule` TR-5.4: `useScrollSpy(['#hero','#about'])` al scrollear retorna el id de la sección visible. Evidence: logging de consola.
  - `rule` TR-5.5: Ningún archivo en Scripts/ usa `require(`. Evidence: Grep.

## Task 6: Implementar átomos (Components/Atoms)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 5
- **Description**:
  - `Components/Button.jsx`: botón con variantes `primary/secondary/ghost`, tamaño `sm/md/lg`, acepta `onClick`, `children`, `disabled`, `className`. Aplica clases Tailwind + tema claro/oscuro usando context o clases dark:.
  - `Components/Badge.jsx`: chip pequeño con color de fondo variable, texto, opcionalmente con ícono.
  - `Components/Icon.jsx`: wrapper que recibe `name` string y renderiza SVG inline (ej: íconos sociales, skills, flechas) o usa `<img src="/Assets/icons/name.svg"/>`. Incluir al menos 8 SVGs inline placeholder (github, linkedin, mail, download, arrow, star, award, code).
  - `Components/Avatar.jsx`: imagen circular con borde, tamaño variable, `src`, `alt`, fallback iniciales.
  - `Components/Input.jsx`: input/textarea controlado, label, mensaje de error, variante según tema, onChange/value por props. Soporta `type="text"`, `"email"`, `"textarea"`.
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-13
- **Test Requirements**:
  - `rule` TR-6.1: Los 5 archivos existen en Components/. Evidence: LS.
  - `rule` TR-6.2: Cada componente está exportado con `export function X` o `export default`; no usa require. Evidence: lectura imports.
  - `rule` TR-6.3: Button + Input respetan tema oscuro al activar clase `dark` en html. Evidence: render visual + DevTools.
  - `rule` TR-6.4: Input muestra `errorMessage` cuando se pasa como prop (inline error). Evidence: render con prop error.

## Task 7: Implementar moléculas (Components/Molecules)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - `Components/SkillCard.jsx`: Recibe `{name, level, category, icon_name}`. Renderiza ícono + nombre + barra de progreso animada (ancho `level%`). Animación con Framer Motion (`initial={{width:0}}, animate={{width:level}}`) al montar. Badge de categoría.
  - `Components/ProjectCard.jsx`: Recibe `{title, description, repo_url, demo_url, image_url, tags, featured}`. Card con imagen (placeholder si no hay), título, badges tags, botones Repo/Demo (atoms Button). Efecto hover: `motion` scale/lift + sombra, sin alterar layout.
  - `Components/ExperienceItem.jsx`: Recibe `{company, role, start_date, end_date, location, description}`. Renderiza role como título, subtítulo empresa+fechas, badge location, descripción.
  - `Components/TimelineItem.jsx`: Wrapper de layout que coloca una línea vertical + punto + componente hijo (por defecto ExperienceItem). Alterna izquierda/derecha en desktop, fullwidth en mobile.
- **Acceptance Criteria Addressed**: AC-6, AC-8, FR-6
- **Test Requirements**:
  - `rule` TR-7.1: 4 archivos existen. Evidence: LS.
  - `rule` TR-7.2: SkillCard renderiza barra con ancho = `level` (p.ej. 80%) y usa Framer Motion para animar desde 0. Evidence: DevTools animation inspect.
  - `rule` TR-7.3: ProjectCard tiene botones con `<a>` con `href` a repo_url y demo_url y abre en `_blank` con `rel="noopener noreferrer"`. Evidence: Read del componente.
  - `rubric` TR-7.4: Hover en cards; scale 1 (sin efecto) a 5 (lift sutil + sombra intensificada + transición suave sin desplazamiento). Scale 1-5; pass >= 4. Evidence: interacción manual.

## Task 8: Implementar organismos + NotificationModal
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 7, Task 4
- **Description**:
  - `Components/Navbar.jsx`: Nav sticky superior con logo/initials, enlaces a `#hero`, `#about`, `#skills`, `#achievements`, `#experience`, `#projects`, `#contact`. Ícono toggle tema (atoms Button/Icon). Usa `useScrollSpy` para resaltar link activo.
  - `Components/HeroSection.jsx`: Sección `#hero` con Avatar, nombre `[Tu nombre]`, rol `[Tu Rol]`, tagline, botones (Descargar CV → `<a href="/Assets/cv.pdf">` y Contacto → scroll a `#contact`). Iconos sociales con links placeholder. Aparición animada con stagger.
  - `Components/AboutMe.jsx`: Sección `#about`. Foto + párrafos placeholder `[Texto sobre ti...]`, badges de información personal (ubicación, disponibilidad, idioma).
  - `Components/SkillsSection.jsx`: `#skills`. Título + cuadrícula 2-3-4 columnas según breakpoint mapeando `useApiData('/api/skills')`, agrupado por categoría opcional.
  - `Components/AchievementsSection.jsx`: `#achievements`. Tarjetas/cards con título certificación, issuer, fecha, botón/link certificado.
  - `Components/ExperienceTimeline.jsx`: `#experience`. Lista de `<TimelineItem><ExperienceItem/></TimelineItem>` usando `useApiData('/api/experiences')`.
  - `Components/ProjectsGallery.jsx`: `#projects`. Grid de ProjectCards; destacar los `featured:true` con tamaño mayor (col-span 2 en desktop).
  - `Components/ContactForm.jsx`: `#contact`. Form con Inputs (name, email, textarea body), botón submit. Validación inline via `validateEmail`/`validateNotEmpty`. Submit llama `apiClient.post('/api/messages', body)`, muestra loading en botón, al terminar llama `notify('success'|'error', 'mensaje')`.
  - `Components/NotificationModal.jsx`: Sistema de toast/modal controlado por contexto o estado elevado. Exponer hook `useNotification` o prop `onClose`; animación entrada/salida; variantes success/error. Sin `alert()`.
  - `Components/Footer.jsx`: Footer con iconos sociales, copyright `[Tu nombre] © año`, link al repo placeholder.
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-8, AC-9, AC-11, FR-7, FR-10, FR-12
- **Test Requirements**:
  - `rule` TR-8.1: 10 organismos creados (Navbar, HeroSection, AboutMe, SkillsSection, AchievementsSection, ExperienceTimeline, ProjectsGallery, ContactForm, NotificationModal, Footer). Evidence: LS.
  - `rule` TR-8.2: Navbar en sticky (`sticky top-0`), tiene 7 enlaces internos + toggle tema, marca activo el link visible en scroll. Evidence: scroll manual.
  - `rule` TR-8.3: ContactForm: submit con datos válidos → POST exitoso + notificación éxito visible. Submit inválido → errores inline sin request. Nunca llama window.alert. Evidence: red DevTools + UI.
  - `rule` TR-8.4: NotificationModal no usa `alert()`; se muestra/oculta con estado React y tiene animación de entrada/salida. Evidence: grep alert() falla + inspección.
  - `rubric` TR-8.5: Animaciones generales de aparición por sección (fade up/slide in con stagger en cards). Scale 1-5; pass >= 4. Evidence: screencast de scroll página completa.

## Task 9: Ensamblar Portfolio.jsx y conectar App completa
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - `Components/Portfolio.jsx`:
    - Renderiza `<Navbar/>`, luego `<main>` con secciones `<HeroSection id="hero"/>`, `<AboutMe id="about"/>`, `<SkillsSection id="skills"/>`, `<AchievementsSection id="achievements"/>`, `<ExperienceTimeline id="experience"/>`, `<ProjectsGallery id="projects"/>`, `<ContactForm id="contact"/>`, por último `<Footer/>`.
    - Cada sección envuelta en un `<motion.section>` con `whileInView`/`viewport={{once:true}}` + animación de entrada fade-up.
    - Envuelve la app en NotificationProvider si se usó contexto para notifications.
  - Asegurar smooth-scroll CSS (`scroll-behavior: smooth;` en `Styles/index.css`).
  - Probar que `npm run dev` (vite) + `node server.js` corren juntos; frontend con proxy `VITE_API_BASE_URL=http://localhost:3001`.
- **Acceptance Criteria Addressed**: AC-1, AC-4, AC-5, AC-8, AC-11
- **Test Requirements**:
  - `rule` TR-9.1: DOM contiene 8 secciones con ids hero, about, skills, achievements, experience, projects, contact (y footer sin id u opcional). Evidence: inspección DOM.
  - `rule` TR-9.2: Navegación ancla clickea y scrollea con smooth behavior. Evidence: interacción manual.
  - `rule` TR-9.3: `npm run dev` abre la app y `Network` muestra 4 GET /api/* exitosos. Evidence: DevTools Network.
  - `rubric` TR-9.4: Diseño visual minimalista, cálido y coherente; tipografía legible, alineaciones consistentes. Scale 1-5; pass >= 4. Evidence: screenshot en ambos temas.

## Task 10: Responsive y ajustes de breakpoint (Bootstrap grid + Tailwind sm/md/lg/xl/2xl)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 9
- **Description**:
  - Garantizar grillas en:
    - Desktop 1920: max-w-screen-2xl centrado con padding razonable, ProjectsGallery con 3-4 columnas (destacados col-span-2), Skills 4 columnas, Timeline 2 lados.
    - Tablet: Projects 2 cols, Skills 2-3 cols, Timeline 1 columna.
    - Mobile (<768px): 1 col, nav hamburguesa simple o links compactados, hero centrado verticalmente, sin overflow horizontal.
  - Bootstrap grid classes (.container, .row, .col-*) utilizados al menos en una sección para cumplir consigna; el resto Tailwind.
  - Ajustar tipografía (text-sm/md/lg/xl responsive con `text-[clamp()]` o clases md:).
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rubric` TR-10.1: Fidelidad responsive en 1920/tablet/mobile. Scale 1-5; pass >= 4. Evidence: screenshots en 3 breakpoints.
  - `rule` TR-10.2: Al menos un uso de `.container .row .col-md-*` de Bootstrap en algún componente (ej: AboutMe). Evidence: grep por `col-md` en Components.
  - `rule` TR-10.3: En viewport 375px ningún elemento produce overflow-x (`document.body.scrollWidth === document.body.clientWidth`). Evidence: DevTools.

## Task 11: Escribir documentación técnica (Docs/) + README.md
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4, Task 9
- **Description**:
  - `Docs/01-estructura-carpetas.md`: detalle de cada carpeta y responsabilidad.
  - `Docs/02-instalacion-local.md`: pasos npm install, crear DB PostgreSQL, ejecutar schema.sql y seed.sql, variables .env, comandos dev (vite) + start (server build dist).
  - `Docs/03-esquema-bd.md`: descripción de tablas, columnas, relaciones (si las hay) y diagrama textual.
  - `Docs/04-decisiones-tecnicas.md`: justificación PostgreSQL vs MySQL, Framer Motion vs CSS, Vite vs CRA, Bootstrap-only-grid, ESM everywhere.
  - `Docs/05-despliegue.md`: pasos sugeridos para Render (monolítico) y alternativa Vercel+Railway, variables de entorno, build command.
  - `README.md` raíz:
    - Título, descripción general, stack.
    - Tabla de contenidos.
    - Instrucciones rápidas (instalación + ejecución).
    - Resumen estructura carpetas.
    - Resumen esquema BD.
    - Placeholders: `LINK_REPOSITORIO_GIT` y `LINK_DESPLIEGUE_PRODUCCION`.
    - Estado del proyecto, licencia opcional.
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-11.1: Existen 5 archivos en Docs/ + README.md. Evidence: LS.
  - `rule` TR-11.2: README.md contiene los placeholders explícitos `LINK_REPOSITORIO_GIT` y `LINK_DESPLIEGUE_PRODUCCION`. Evidence: Grep.
  - `rule` TR-11.3: `Docs/02-instalacion-local.md` enumera los comandos `npm install`, creación de DB PostgreSQL y ejecución de schema + seed. Evidence: Read.
  - `rubric` TR-11.4: Claridad de documentos; escala 1-5 pass >= 4. Evidence: lectura.

## Task 12: Verificación final y checklist de ACs
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 11, Task 10
- **Description**:
  - Ejecutar build vite + lint/typecheck si hay; correr server.js contra dist y verificar que SPA responde.
  - Correr comprobaciones:
    - Grep `require(` en frontend.
    - Grep `alert(` en todo el proyecto.
    - Build exitoso sin errores.
    - README y Docs presentes.
  - Registrar Completion Evidence global.
- **Acceptance Criteria Addressed**: Todas las ACs (cierre final)
- **Test Requirements**:
  - `rule` TR-12.1: Grep `require(` en Components/ Scripts/ Styles/ retorna 0 matches.
  - `rule` TR-12.2: Grep `alert(` en Components/ Scripts/ Styles/ server.js retorna 0 matches.
  - `rule` TR-12.3: `npx vite build` + `node server.js` (con PORT y DB) y abrir root `/` sirve el index.html de dist.
  - `rule` TR-12.4: Todas las tareas previas tienen estado completado y evidencia.
