# 🍂 Gestor de Tareas SPA (Práctica R2)

Aplicación de lista de tareas desarrollada en **React + Vite + React Router v6 + TailwindCSS + Bootstrap**. SPA completa con enrutamiento, modo claro/oscuro, estado global con Context API y exportación JSON.

---

## 🚀 Instalación y ejecución

### Prerrequisitos
- Node.js ≥ 18.x
- npm ≥ 9.x

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (Vite)
npm run dev
# Abre http://localhost:5173 en tu navegador

# 3. Build para producción
npm run build
# Los archivos compilados quedan en /dist

# 4. Preview del build
npm run preview

# 5. Ejecutar servidor Express (para producción, requiere build previo)
npm start
# Disponible en http://localhost:3000
```

---

## 📁 Estructura del proyecto

```
R2/
├── src/
│   ├── Assets/          # Imágenes, íconos (vacío en esta práctica)
│   ├── Components/      # Componentes atomizados y reutilizables
│   │   ├── BotonVolver.jsx
│   │   ├── EstadoBadge.jsx
│   │   ├── FormularioTarea.jsx
│   │   ├── TareaItem.jsx
│   │   └── Toast.jsx
│   ├── Context/         # Context API (estado global)
│   │   ├── TareasContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── Data/
│   │   └── tareasIniciales.js   # Array de tareas mock
│   ├── Layouts/         # Wrappers de página
│   │   ├── Layout.jsx
│   │   └── Navbar.jsx
│   ├── Pages/           # Páginas (vistas)
│   │   ├── Home.jsx
│   │   ├── Detalle.jsx
│   │   └── Crear.jsx
│   ├── Scripts/         # Lógica, router, utils
│   │   ├── router.jsx
│   │   └── utils.js
│   ├── Styles/
│   │   └── index.css    # Tailwind + temas claro/oscuro
│   ├── App.jsx
│   └── main.jsx         # Entry point
├── index.html
├── package.json
├── postcss.config.js
├── server.js            # Servidor Express para producción
├── tailwind.config.js   # Paleta otoñal + dark mode
├── vite.config.js
└── .gitignore
```

> Organización **por tipo de archivo** (no por feature). En la raíz solo viven `server.js` y los archivos de configuración.

---

## 🛣️ Estructura de rutas (React Router v6)

Configurada en [Scripts/router.jsx](file:///c:/Users/fedes/OneDrive/Documentos/GitHub/PDelSC/React/R2/src/Scripts/router.jsx):

| Ruta          | Página      | Descripción                                                          |
|---------------|-------------|----------------------------------------------------------------------|
| `/`           | **Home**    | Listado completo de tareas en grilla responsive + estadísticas.      |
| `/tarea/:id`  | **Detalle** | Vista individual de una tarea por `id` dinámico. Maneja id inválido. |
| `/crear`      | **Crear**   | Formulario controlado para crear tarea nueva con validación.         |
| `*`           | Home        | Cualquier ruta no definida → fallback al inicio.                     |

---

## 📄 Descripción de cada página

### 1. Home (`/`)
- Muestra **estadísticas**: total, pendientes, completadas (con porcentaje).
- **Grilla responsive** de tarjetas (1 col mobile → 2 tablet → 3/4 desktop).
- Cada tarjeta es un `<Link>` react-router a `/tarea/:id`.
- Botón destacado **"Crear nueva tarea"** que navega a `/crear`.
- Estado vacío amigable si no hay tareas.

### 2. Detalle (`/tarea/:id`)
- Obtiene el parámetro `:id` mediante el hook `useParams()`.
- Busca la tarea vía `useTareas().obtenerTareaPorId(id)`.
- Muestra: título completo, descripción multilínea, fecha formateada (ES), badge de estado.
- **Botón Volver** (usa `useNavigate(-1)` si hay historial, sino `/`).
- Acciones: marcar completa/incompleta, eliminar (con confirmación).
- Maneja **id inválido/inexistente**: mensaje 404 amigable + enlaces.

### 3. Crear (`/crear`)
- **Formulario controlado** (`useState`): título, descripción, switch "¿Completa?".
- Validación cliente (título ≥3 chars, descripción ≥10 chars) con mensajes inline.
- Contador de caracteres en la descripción.
- Al hacer submit:
  1. Genera `id` con `crypto.randomUUID()`.
  2. Genera `fechaCreacion` con `new Date().toISOString()`.
  3. Agrega al contexto global.
  4. Muestra **Toast de éxito** (nunca `alert()`).
  5. Redirige al detalle de la tarea recién creada con `useNavigate()`.

---

## 🎨 Tema claro / oscuro

- **Context API** (`ThemeContext.jsx`).
- Persistencia automática en **localStorage** (`tema-app`).
- Toggle en el Navbar (🌙 / ☀️).
- Implementado con `darkMode: 'class'` en Tailwind.
- Paleta **otoñal relajada** (jamás hardcodeada, definida en `tailwind.config.js`):
  - **Claro**: beige, crema, terracota suave, verde oliva, marrón claro.
  - **Oscuro**: marrón chocolate, mostaza apagado, borgoña, gris cálido.

---

## 🔔 Sistema de notificaciones

- 100% libre de `alert()` y `confirm()` (excepto confirmación de borrado, que es `window.confirm` nativo del navegador).
- Componente **Toast** controlado por `ToastContext`.
- 3 tipos: `exito` (verde/mostaza), `error` (terracota/borgoña), `info` (marrón/gris).
- Auto-ocultamiento configurable (default 3000ms).
- Botón de cierre manual.
- Animación slide-in desde la derecha.

---

## 💾 Exportar JSON (archivo descargable)

- Botón en el **Navbar**: "⬇️ Exportar JSON".
- Implementado con `Blob` + `URL.createObjectURL()` (sin librerías).
- Nombre de archivo: `tareas_YYYY-MM-DD.json`.
- Descarga inmediata del estado **actual** de todas las tareas.
- Toast de confirmación luego de exportar.

---

## 🧱 Decisiones de diseño (breve explicación)

### 1. Estado global con Context API (en lugar de prop drilling)
El estado de tareas y el tema se necesitan en **múltiples niveles** de la jerarquía:
- `TareasContext` alimenta a Home (leer lista), Detalle (leer/modificar) y Crear (agregar).
- `ThemeContext` lo consume Navbar y todos los componentes de UI.
- `ToastContext` se accede desde cualquier página/componente.

Sin Context habría que pasar props por 3–4 niveles (Layout → Pages → Components), generando acoplamiento innecesario.

### 2. Atomización de componentes
Cada componente hace **una sola cosa bien**:
- **TareaItem** → solo renderiza una tarjeta del listado.
- **EstadoBadge** → solo muestra ✓/⏳ con colores condicionales.
- **FormularioTarea** → solo maneja state/validación del form.
- **Toast** → solo notificaciones.
- **BotonVolver** → abstrae `useNavigate` + variantes de estilo.

Beneficios: reutilización, testeo unitario, lectura rápida y mantenimiento sencillo.

### 3. Rutas dinámicas `/tarea/:id`
- El `:id` se captura con `useParams()` (hook de React Router v6).
- La data se consulta desde el contexto (no desde props).
- Caso borde manejado: si `obtenerTareaPorId(id)` devuelve `undefined`, se muestra la vista "Tarea no encontrada" en lugar de romperse.
- Al crear una tarea nueva, se redirige a su detalle (`navigate('/tarea/' + idNuevo)`) para flujo natural.

---

## 📱 Responsive Design

- **Bootstrap**: `container`, `row`, `col-*`, `d-flex`, breakpoints (`sm`, `md`, `lg`, `xl`, `xxl`).
- **Tailwind**: complementa con utilidades de espaciado, colores y estados.
- Optimizado para:
  - Desktop 1920×1080: grilla de 4 columnas en Home.
  - Tablet 768px: 2 columnas.
  - Mobile 375px: 1 columna, Navbar apilado.

---

## 🛠️ Stack tecnológico resumen

| Tecnología         | Versión | Uso                                  |
|--------------------|---------|--------------------------------------|
| React              | 18.x    | UI                                   |
| Vite               | 5.x     | Bundler (reemplazo CRA deprecado)    |
| React Router DOM   | 6.x     | Enrutamiento SPA                     |
| TailwindCSS        | 3.x     | Estilos + paleta + dark mode         |
| Bootstrap          | 5.x     | Grid responsive + clases utilitarias |
| Express            | 4.x     | Server estático de producción        |
| JavaScript ES      | ES2022  | Modules (`import` / `export`)        |

---

⌨️ Hecho con ❤️ y 🍂 para la práctica R2 de React.
