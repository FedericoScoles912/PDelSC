# Portfolio Personal (React + Tailwind + SQL) — Product Requirements Document

## Overview
- **Summary**: Aplicación web de tipo portfolio SPA (Single Page Application) full-stack, moderna, animada, responsive, con modo claro/oscuro y conectada a base de datos SQL mediante API REST Express. El contenido se carga dinámicamente desde la base de datos (no hardcodeado en JSX).
- **Purpose**: Servir como portfolio profesional personalizado y como ejercicio técnico de integración full-stack (React + Tailwind + Node/Express + SQL), siguiendo patrones de Atomic Design, persistencia de tema, animaciones, validación y despliegue listo para host cloud.
- **Target Users**: Desarrollador/a dueño/a del portfolio (editor final del contenido) y reclutadores/clientes que visitan la página.

## Goals
- Construir una SPA de portfolio de una sola página (anclas/scroll) con 8 secciones.
- Aplicar una arquitectura full-stack con capa de datos SQL, API REST Express y frontend React.
- Implementar Atomic Design (átomos → moléculas → organismos → página) en los componentes.
- Incorporar modo claro/oscuro persistente con paletas otoñales cálidas.
- Incluir animaciones de aparición en scroll, hover y barras de skills animadas.
- Validar y almacenar mensajes de contacto en la DB (sin alert(), con Modal/Toast propio).
- Cumplir con la estructura de carpetas obligatoria por tipo de archivo.
- Generar documentación técnica (Docs/) y README con instrucciones de instalación y despliegue.
- Preparar el proyecto para despliegue en Render/Railway/Vercel + PostgreSQL (variables de entorno).
- Usar exclusivamente import/export ES6 en todo el código JS (sin require en frontend).

## Non-Goals
- Sistema de autenticación o panel de administración web (el contenido se carga desde seed.sql o el usuario edita la DB directamente).
- Ruteo multipágina con React Router: es una sola página con anclas internas.
- Test suite automatizado de frontend/backend (no requerido por el prompt, se indica solamente verificación manual).
- Subida de imágenes/archivos en el formulario de contacto.
- Internacionalización (solo español en textos y comentarios).

## Background & Context
- Repositorio vacío en `R4/`; sin historial de commits ni código existente.
- Stack obligatorio por consigna: React Hooks (useState, useEffect, useContext + custom hooks), TailwindCSS + Bootstrap (solo grid/breakpoints responsive), Node.js + Express server.js en raíz, SQL (MySQL o PostgreSQL), ES Modules.
- Se requiere código comentado en español, placeholders claros como `[Tu nombre]`, `[Tu proyecto 1]`, etc.
- Paleta otoñal definida por el usuario (modo claro/oscuro) sin blanco/negro puros.

## Functional Requirements
- **FR-1**: Estructura de carpetas por tipo de archivo: server.js y package.json en raíz + Scripts, Components, Styles, Assets, Database, Routes, Docs.
- **FR-2**: Backend Express con server.js en raíz, conexión a PostgreSQL y routers en /Routes (skills, projects, experiences, achievements, messages).
- **FR-3**: Base de datos PostgreSQL con esquema (schema.sql) y datos de ejemplo (seed.sql) para skills, projects, experiences, achievements, messages.
- **FR-4**: API REST que exponga GET para cargar el portfolio y POST para guardar mensajes de contacto, con CORS habilitado.
- **FR-5**: Frontend React con página principal Portfolio.jsx que ensambla secciones mediante navegación por anclas.
- **FR-6**: Componentes siguiendo Atomic Design:
  - Átomos: Button, Badge, Icon, Avatar, Input
  - Moléculas: SkillCard, ProjectCard, ExperienceItem, TimelineItem
  - Organismos: SkillsSection, ProjectsGallery, ExperienceTimeline, AboutMe, ContactForm
  - Página: Portfolio.jsx
- **FR-7**: Las 8 secciones del portfolio: Hero, Sobre mí, Habilidades, Logros/Certificaciones, Experiencia (timeline), Proyectos (galería cards), Contacto (form + guardado en DB), Footer redes.
- **FR-8**: Todo el contenido dinámico del portfolio se carga via fetch a la API propia (sin hardcodear en JSX).
- **FR-9**: Animaciones: aparición de secciones al hacer scroll, hover en ProjectCard, transición tema claro/oscuro, barras de skills animadas.
- **FR-10**: Componente Modal/Toast propio (NotificationModal.jsx) para mensajes éxito/error; prohibido alert().
- **FR-11**: Modo claro/oscuro persistente mediante useContext + localStorage, con paletas otoñales configuradas en tailwind.config.js.
- **FR-12**: Formulario de contacto validado cliente + servidor; al enviar se guarda en la tabla `messages` y se muestra notificación.
- **FR-13**: Responsive para 1920x1080 (contenedor fluido, sin espacios muertos), tablet y mobile usando clases responsive Tailwind + Bootstrap grid.
- **FR-14**: Scroll listener para resaltar el enlace activo de la navegación.
- **FR-15**: Documentación: README.md + /Docs (estructura carpetas, instalación, esquema DB, decisiones técnicas, despliegue).
- **FR-16**: Archivo .env.example con credenciales DB y puerto, sin datos reales.

## Non-Functional Requirements
- **NFR-1**: Código comentado en español, módulos ES6 (`import`/`export`), Single Responsibility por componente.
- **NFR-2**: Paletas de colores consistentes y accesibles (contraste suficiente entre texto y fondo en ambos temas).
- **NFR-3**: Portabilidad: las rutas, imports y configuración deben ser portables a migraciones de repositorio (sin paths absolutos del entorno local).
- **NFR-4**: Seguridad básica: credenciales DB solo en variables de entorno, sanitización mínima en endpoints, no loggear secrets.
- **NFR-5**: Build reproducible: package.json y package-lock.json con dependencias declaradas.
- **NFR-6**: Rendimiento perceptual: animaciones fluidas (CSS/Framer Motion), carga incremental de secciones.

## Constraints
- **Technical**:
  - Usar React + Hooks (useState, useEffect, useContext) + custom hooks.
  - TailwindCSS + Bootstrap (Bootstrap solo para utilidades responsive de grid/breakpoints).
  - Backend: Node.js + Express, archivo server.js en la raíz.
  - Base de datos: PostgreSQL (elegida sobre MySQL por mejor soporte nativo en Render, Railway, Supabase, Vercel Postgres; tipos más robustos; sintaxis SQL más estándar para migraciones).
  - Librería animaciones: Framer Motion (integración idiomática con React, soporte para scroll triggers, stagger, motion values, mejor que CSS puro para timeline animado).
  - Todo código JS/JSX debe usar `import`/`export` (no `require` en frontend; backend permitido si se configura `type: module` en package.json).
  - Prohibido `alert()`: usar Modal/Toast propio.
- **Business**:
  - No se incluyen datos personales reales; todo placeholder debe ser explícito (`[Tu nombre]`, etc.).
  - El diseño debe ser minimalista, limpio y cálido (estética otoñal), con legibilidad perfecta y centrado óptico.
- **Dependencies**:
  - PostgreSQL cliente: `pg` (paquete npm oficial).
  - Express, cors, dotenv.
  - React 18, react-dom, react-scripts o Vite (se elige Vite por build más rápido y ESM nativo).
  - TailwindCSS, postcss, autoprefixer.
  - Bootstrap (solo import de grid/breakpoints: bootstrap/dist/css/bootstrap-grid.min.css o similar, NO el bundle entero de componentes).
  - Framer Motion.

## Assumptions
- El usuario final contará con PostgreSQL local (o Docker) para desarrollo, o usará un servicio manejado para producción.
- El build de frontend se sirve desde Express como contenido estático (para despliegue monolítico en Render), aunque se documenta también la alternativa split (Vercel frontend + Railway backend).
- Se usará `npm` como gestor de paquetes (genera package-lock.json).
- El formulario de contacto no envía emails; solo persiste en DB y muestra notificación en UI.

## Acceptance Criteria

### AC-1: Estructura de carpetas y archivos obligatorios presente
- **Type**: `rule`
- **Given**: Proyecto generado en la raíz `R4/`
- **When**: Se listan directorios y archivos de primer nivel
- **Then**: Existen `server.js`, `package.json`, `package-lock.json`, y las carpetas `Scripts/`, `Components/`, `Styles/`, `Assets/`, `Database/`, `Routes/`, `Docs/`, `README.md`, `.env.example`
- **Pass Condition**: `LS` de raíz muestra al menos todos los ítems listados
- **Evidence**: Listado de directorio y existencias de archivos clave

### AC-2: Backend Express con conexión PostgreSQL y API REST
- **Type**: `rule`
- **Given**: Dependencias instaladas y PostgreSQL corriendo con schema+seed cargados
- **When**: Se ejecuta `node server.js` y se hacen llamadas HTTP a `/api/skills`, `/api/projects`, `/api/experiences`, `/api/achievements` (GET) y `/api/messages` (POST con body JSON)
- **Then**: Los endpoints retornan 200 con JSON; `messages` inserta un registro y devuelve el ID
- **Pass Condition**: 5 endpoints responden exitosamente con datos esperados
- **Evidence**: Salida de curl/httpie o equivalente para cada endpoint

### AC-3: Scripts SQL de esquema y seed presentes y ejecutables
- **Type**: `rule`
- **Given**: `Database/schema.sql` y `Database/seed.sql` creados
- **When**: Se ejecutan secuencialmente en una BD PostgreSQL vacía
- **Then**: Se crean 5 tablas (skills, projects, experiences, achievements, messages) con claves foráneas/índices mínimos y seed inserta al menos 3 filas de ejemplo por tabla
- **Pass Condition**: `SELECT count(*) FROM <tabla>` devuelve >= 3 para skills/projects/experiences/achievements
- **Evidence**: Salida de consola psql tras ejecutar ambos scripts

### AC-4: Frontend carga contenido dinámicamente desde API
- **Type**: `rule`
- **Given**: Backend corriendo con datos seed
- **When**: Se abre la app React en el navegador y se inspecciona la red
- **Then**: Se disparan requests GET a los 4 endpoints de contenido y las secciones renderizan datos de la API (no placeholders hardcodeados)
- **Pass Condition**: 4 requests GET exitosos y UI renderiza los registros de seed
- **Evidence**: Captura de Network tab y screenshot de UI poblada

### AC-5: 8 secciones renderizadas en una sola página con navegación por anclas
- **Type**: `rule`
- **Given**: App montada en Portfolio.jsx
- **When**: Se navega haciendo scroll o clickeando enlaces del nav
- **Then**: Se aprecian Hero, About, Skills, Achievements, Experience, Projects, Contact, Footer, cada una con su `id` único y el scroll va a ella al clickear el link
- **Pass Condition**: 8 secciones presentes en DOM con IDs correspondientes y navegación ancla funcional
- **Evidence**: Inspección de DOM + interacción manual

### AC-6: Atomic Design respetado (átomos / moléculas / organismos / página)
- **Type**: `rule`
- **Given**: Carpeta `Components/` creada
- **When**: Se listan archivos JSX
- **Then**: Existen al menos 5 átomos, 4 moléculas, 5 organismos y Portfolio.jsx; cada componente se importa/exporta con responsabilidad única
- **Pass Condition**: Archivos: Button.jsx, Badge.jsx, Icon.jsx, Avatar.jsx, Input.jsx; SkillCard.jsx, ProjectCard.jsx, ExperienceItem.jsx, TimelineItem.jsx; SkillsSection.jsx, ProjectsGallery.jsx, ExperienceTimeline.jsx, AboutMe.jsx, ContactForm.jsx; Portfolio.jsx
- **Evidence**: Listado de archivos y análisis de imports

### AC-7: Modo claro/oscuro persistente con paletas otoñales
- **Type**: `rule`
- **Given**: Tailwind configurado con colores personalizados y ThemeContext creado
- **When**: Se togglean los temas y se recarga la página
- **Then**: Los colores aplicados coinciden con las paletas definidas en tailwind.config.js (crema/terracota/oliva/marrón en claro; marrón oscuro/naranja quemado/mostaza/beige en oscuro) y la preferencia persiste en localStorage
- **Pass Condition**: Valor `theme` en localStorage coincide con UI; clases dark/light aplicadas en `<html>` o wrapper raíz
- **Evidence**: Inspección de localStorage + computed styles tras toggle

### AC-8: Animaciones funcionales (scroll, hover, skills)
- **Type**: `rubric`
- **Dimension**: Calidad y alcance de animaciones
- **Scale**: 1-5
- **Anchors**: 1 = sin animaciones; 3 = al menos hover en cards + barras skill; 5 = aparición por sección (fade/slide-in) con stagger, hover elegante en cards, transición de tema suave, barras skill animadas con contador/valor al llegar a viewport
- **Pass Threshold**: >= 4
- **Evidence**: Interacción manual + screenshot/video

### AC-9: Formulario de contacto validado, guarda en DB, muestra notificación sin alert()
- **Type**: `rule`
- **Given**: Form con campos (nombre, email, mensaje) y NotificationModal.jsx
- **When**: Se envía con datos válidos y con datos inválidos
- **Then**: Caso válido: se llama POST /api/messages, se inserta en BD, se muestra toast de éxito; caso inválido: errores inline, no se hace request, no aparece alert()
- **Pass Condition**: Registro nuevo en `messages` tras submit válido y modal/toast visible en UI
- **Evidence**: SELECT en DB + captura de notificación mostrada

### AC-10: Responsive correcto en desktop 1920, tablet y mobile
- **Type**: `rubric`
- **Dimension**: Fidelidad responsive y aprovechamiento de pantalla
- **Scale**: 1-5
- **Anchors**: 1 = layout roto en algún breakpoint; 3 = usable en 3 tamaños pero con espacios muertos en 1920; 5 = aprovechamiento fluido del ancho en 1920 (sin columnas absurdamente estrechas ni márgenes excesivos), tablet y mobile sin overflow horizontal, tipografía y grilla adaptadas
- **Pass Threshold**: >= 4
- **Evidence**: Screenshots en cada breakpoint

### AC-11: Navegación resalta la sección activa en scroll
- **Type**: `rule`
- **Given**: Nav con enlaces a secciones y hook/listener de scroll
- **When**: Se hace scroll por la página
- **Then**: El link de la sección actualmente visible queda marcado visualmente (estilo activo)
- **Pass Condition**: El estilo activo cambia correctamente al atravesar cada sección
- **Evidence**: Video/gif de scroll con estados del nav

### AC-12: Documentación completa (README + Docs/)
- **Type**: `rule`
- **Given**: Archivos README.md y Docs/ con al menos: descripción general, instalación local (frontend+backend+DB), esquema DB, estructura carpetas, justificación decisiones técnicas, despliegue, .env.example
- **When**: Se revisan README y archivos Docs
- **Then**: Todas las secciones mencionadas están presentes y el README contiene placeholders para repo link y deploy link
- **Pass Condition**: Revisión textual de documentos
- **Evidence**: Contenido de README.md y archivos en Docs/

### AC-13: Código usa ES Modules (import/export) y no hay require en frontend
- **Type**: `rule`
- **Given**: Todo código JS/JSX desarrollado
- **When**: Se busca `require(` en archivos de Components/, Scripts/, Styles/, Portfolio.jsx
- **Then**: 0 coincidencias en frontend; backend puede usar ESM (`type: module`) en package.json
- **Pass Condition**: Grep `require(` sin matches en carpetas de frontend
- **Evidence**: Salida de Grep

## Open Questions
- [ ] ¿Aceptar Vite en lugar de create-react-app/react-scripts? (Recomendado: ESM nativo + build más rápido; asumido que sí por optimización sin alterar diseño visual).
- [ ] ¿Confirmar PostgreSQL sobre MySQL? (Justificado en Constraints; asumido que sí por soporte cloud).
- [ ] ¿Incluir en el hero una imagen placeholder vía URL de imagen generada, o dejar el tag `<img>` con `src="/Assets/avatar.png"` y el usuario coloca la suya? (Asumido: Assets con placeholders e instrucciones en Docs).
