# Estructura de Carpetas

Este documento describe la organización del proyecto y la responsabilidad de cada carpeta y archivo principal.

## Archivos de Raíz

| Archivo | Responsabilidad |
|---------|-----------------|
| `server.js` | Punto de entrada del servidor Express. Configura CORS, sirve los archivos estáticos del build (`dist/`), monta las rutas de la API bajo `/api/*` y resuelve el fallback de rutas de React Router al `index.html`. |
| `package.json` | Define las dependencias del proyecto (producción y desarrollo), los scripts NPM (`dev`, `build`, `start`, `server:dev`), el motor Node requerido (>=18) y el tipo de módulo (`type: module` para ESM nativo). |
| `.env.example` | Plantilla de variables de entorno. Contiene los placeholders para la configuración del puerto Express, credenciales de PostgreSQL y URL base de la API para Vite. |
| `vite.config.js` | Configuración de Vite: plugin de React y eventualmente proxy/alias. |
| `tailwind.config.js` | Configuración de Tailwind CSS: colores del tema otoñal, fuentes, rutas de escaneo (`content`). |
| `postcss.config.js` | Configuración de PostCSS con plugins `tailwindcss` y `autoprefixer`. |
| `index.html` | HTML raíz usado por Vite en desarrollo y compilado en `dist/`. Contiene el `div#root` y los imports de entrada. |

## Carpetas

### `/Scripts`
Punto de entrada y lógica transversal del frontend.

| Archivo | Responsabilidad |
|---------|-----------------|
| `main.jsx` | Entry point de React. Renderiza el árbol de componentes dentro de `#root` y envuelve la app en los Context Providers (Tema, Notificaciones). |
| `apiClient.js` | Cliente HTTP centralizado que usa `fetch`. Construye las URLs usando `VITE_API_BASE_URL` y define helpers reutilizables (`GET`, `POST`) con manejo de errores. |
| `useApiData.js` | Hook personalizado que abstrae la carga de datos desde la API, manejo de estados `loading / error / data` y caching básico. |
| `useScrollSpy.js` | Hook personalizado que detecta la sección visible al hacer scroll para resaltar el enlace correspondiente en el Navbar. |
| `ThemeContext.jsx` | Context API para gestionar el tema otoñal (colores, modo) y exponerlo a toda la app. |
| `NotificationContext.jsx` | Context API para mostrar notificaciones (modal/toast) al enviar el formulario de contacto u otras acciones. |
| `utils.js` | Funciones auxiliares genéricas (formateo de fechas, validaciones, normalización de strings). |

### `/Components`
Componentes React reutilizables y de interfaz, organizados por sección del portfolio.

| Archivo | Responsabilidad |
|---------|-----------------|
| `Portfolio.jsx` | Componente contenedor principal. Ensambla todas las secciones (Hero, AboutMe, Skills, Projects, Experience, Achievements, Contact, Footer). |
| `Navbar.jsx` | Barra de navegación fija con links a secciones y scroll-spy activo. |
| `HeroSection.jsx` | Sección de bienvenida con título, subtítulo, foto/avatar y CTA principal. |
| `AboutMe.jsx` | Sección "Sobre mí" con descripción personal y foto. |
| `SkillsSection.jsx` | Sección que lista las habilidades agrupadas por categoría. |
| `SkillCard.jsx` | Tarjeta individual de habilidad con barra de progreso animada. |
| `ProjectsGallery.jsx` | Galería/grilla de proyectos destacados. |
| `ProjectCard.jsx` | Tarjeta individual de proyecto con título, descripción, tags y links a repo/demo. |
| `ExperienceTimeline.jsx` | Línea de tiempo de experiencia laboral. |
| `ExperienceItem.jsx` | Item individual de la timeline (empresa, cargo, fechas, descripción). |
| `AchievementsSection.jsx` | Sección de certificaciones y logros. |
| `ContactForm.jsx` | Formulario de contacto controlado que envía datos a `/api/messages`. |
| `NotificationModal.jsx` | Modal de feedback para confirmar el envío del mensaje o mostrar errores. |
| `Footer.jsx` | Pie de página con copyright, redes sociales y links de interés. |
| `Avatar.jsx` | Componente de avatar/imagen con estilos y fallback. |
| `Badge.jsx` | Componente de etiqueta (badge) para tags, categorías. |
| `Button.jsx` | Componente botón reutilizable con variantes (primario/secundario). |
| `Input.jsx` | Componente input/textarea reutilizable para formularios. |
| `Icon.jsx` | Wrapper de íconos SVG (inline) para mantener consistencia. |
| `TimelineItem.jsx` | Item genérico de línea de tiempo usado por experiencia/achievements. |

### `/Styles`
Estilos globales y específicos del tema.

| Archivo | Responsabilidad |
|---------|-----------------|
| `index.css` | Punto de entrada de estilos. Importa Tailwind (`@tailwind base/components/utilities`), Bootstrap grid, y define reglas globales (reset, tipografía base, scroll suave). |
| `theme.css` | Variables CSS personalizadas para el tema otoñal (paleta de colores, espaciados, radios) y utilidades extendidas que se usan tanto en Tailwind como en CSS tradicional. |

### `/Assets`
Recursos estáticos del frontend: imágenes (JPG/PNG/SVG), íconos, fuentes locales, favicon y archivos de medios que son importados por Vite y compilados en `dist/assets`.

### `/Database`
Capa de persistencia.

| Archivo | Responsabilidad |
|---------|-----------------|
| `connection.js` | Instancia del cliente `pg` (node-postgres) configurada con las variables de entorno (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). Exporta el pool de conexiones reutilizable por las rutas. |
| `schema.sql` | Definición DDL de la base de datos: las 5 tablas (`skills`, `projects`, `experiences`, `achievements`, `messages`), sus constraints, `CHECK`, `DEFAULT` e índices de performance. Incluye `DROP TABLE IF EXISTS` para reinicios limpios. |
| `seed.sql` | Datos iniciales de ejemplo: registros pre-cargados para poblar las 5 tablas y que el portfolio tenga contenido visible al levantar la app por primera vez. |

### `/Routes`
Controladores de la API REST (Express Router) organizados por recurso. Cada archivo define las rutas bajo `/api/<recurso>` y usa `Database/connection.js` para ejecutar queries.

| Archivo | Endpoints principales | Responsabilidad |
|---------|----------------------|-----------------|
| `skills.js` | `GET /api/skills` | Devuelve la lista de habilidades, opcionalmente filtradas por `?category=`. |
| `projects.js` | `GET /api/projects`, `GET /api/projects/:id` | Devuelve proyectos, con opción de filtrar `?featured=true`. |
| `experiences.js` | `GET /api/experiences` | Devuelve la experiencia laboral ordenada por `start_date DESC`. |
| `achievements.js` | `GET /api/achievements` | Devuelve certificaciones/logros ordenados por `date_earned DESC`. |
| `messages.js` | `POST /api/messages`, `GET /api/messages` | Crea un nuevo mensaje desde el formulario de contacto; lista mensajes (admin). |

### `/Docs`
Documentación del proyecto. Contiene esta guía de estructura, instrucciones de instalación, detalle del esquema BD, decisiones técnicas y opciones de despliegue.
