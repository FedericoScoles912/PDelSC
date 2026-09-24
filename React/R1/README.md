# 🍂 Ejercicios Progresivos de React

Proyecto de práctica con **5 ejercicios progresivos** de React, construido con **Vite**, **TailwindCSS** (paleta otoñal) y **Bootstrap** (solo grid/utilidades responsive). Incluye modo claro/oscuro persistente con Context API + localStorage.

---

## 🚀 Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar entorno de desarrollo (Vite)
npm run dev
# Abre http://localhost:5173

# 3. Build para producción
npm run build
# Genera /dist

# 4. Previsualizar el build
npm run preview

# 5. Servidor Express (sirve /dist)
npm start
```

---

## 🗂 Estructura de carpetas

```
R1/
├── server.js                  # Servidor Express para producción
├── package.json
├── vite.config.js
├── tailwind.config.js         # Paleta otoñal extendida
├── postcss.config.js
├── .gitignore
├── index.html
└── src/
    ├── main.jsx               # Punto de entrada + ThemeProvider
    ├── App.jsx                # Router/selector de ejercicios
    ├── Context/
    │   └── ThemeContext.jsx   # Modo claro/oscuro (Context API + localStorage)
    ├── Layouts/
    │   ├── Header.jsx         # Navbar + menú de ejercicios
    │   └── LayoutApp.jsx      # Layout principal (header/main/footer)
    ├── Components/            # Todos los componentes atomizados
    │   ├── HolaMundo.jsx          # Ej. 1
    │   ├── TarjetaPresentacion.jsx# Ej. 2
    │   ├── Contador.jsx           # Ej. 3
    │   ├── ListaTareas.jsx        # Ej. 4 (padre)
    │   ├── TareaItem.jsx          # Ej. 4 (sub)
    │   ├── FormularioTarea.jsx    # Ej. 4 (sub)
    │   ├── FormularioSimple.jsx   # Ej. 5
    │   ├── Modal.jsx              # Modal/Toast propio (sin alert)
    │   ├── EjercicioWrapper.jsx   # Card común a todos los ejercicios
    │   └── ThemeToggle.jsx        # Botón sol/luna del tema
    ├── Scripts/               # Lógica pura JS (hooks, utils, helpers)
    │   └── helpers.js             # generarId(), clamp(), capitalizar()
    ├── Styles/                # CSS + Tailwind + temas
    │   ├── index.css              # Tailwind + Bootstrap utilities + @layer
    │   ├── tema-claro.css
    │   └── tema-oscuro.css
    └── Assets/                # Imágenes / íconos
```

---

## 🧩 Descripción de los ejercicios

### 1 · Hola Mundo (`HolaMundo.jsx`)
Componente sin estado que muestra **"¡Hola, mundo!"** en 3 variantes de estilo:
- Tipografía grande + color sólido
- Cursiva + animación `pulse` lenta
- Texto gradiente + animación `bounce` lenta

### 2 · Tarjeta de presentación (`TarjetaPresentacion.jsx`)
Componente `Tarjeta` **reutilizable** que recibe props:
- `nombre`, `apellido`, `profesion`, `imagen` (URL)
- Diseño tipo card con **foto circular, sombra y efecto hover** (elevate + glow).
- Se renderizan 3 instancias de ejemplo.

### 3 · Contador (`Contador.jsx`)
Estado local con `useState`. Funcionalidades:
- Botón `+` incrementar, `−` decrementar, `↺ Reset`
- **No permite valores negativos** (clamp 0..999)
- Botones se deshabilitan visualmente en los límites.

### 4 · Lista de tareas (`ListaTareas.jsx`)
`useState` con un array de objetos `{ id, texto, completada }`.
- **Subcomponentes atómicos**:
  - `FormularioTarea`: input + botón agregar.
  - `TareaItem`: checkbox visual + texto tachado + botón eliminar.
- Contador de progreso (completadas / total %).
- Mensaje de lista vacía.

### 5 · Formulario simple (`FormularioSimple.jsx`)
Input controlado con `useState` que captura el nombre.
- Al enviar, **muestra un Modal propio en JS** (componente `Modal.jsx`) — **nunca usa `alert()`**.
- Cierre por botón, click fuera del modal o tecla **Escape**.
- 4 variantes de color: `success | info | warning | error`.

---

## 🌓 Modo claro / oscuro

- Implementado con **Context API** (`/Context/ThemeContext.jsx`).
- Persistencia en **localStorage** (`app-tema-oton`).
- Detecta `prefers-color-scheme` del navegador en la carga inicial.
- Aplica la clase `.dark` en `<html>` para que Tailwind funcione con `darkMode: 'class'`.
- Toggle visible en el navbar (botón sol/luna).

### Paleta otoñal definida en `tailwind.config.js`

| Modo claro |  | Modo oscuro |  |
|---|---|---|---|
| `light-beige` | `#F5F0E1` | `dark-chocolate` | `#3E2723` |
| `light-crema` | `#FFF8E7` | `dark-mostaza`   | `#B08968` |
| `light-terracota` | `#C97B63` | `dark-borgona` | `#6D2E46` |
| `light-oliva` | `#6B705C` | `dark-gris`    | `#4A403A` |
| `light-marron` | `#A68A64` | `dark-crema`   | `#D4A373` |

Nunca se hardcodean colores hex en los componentes; siempre se usan estas clases.

---

## 📐 Responsive (Bootstrap + Tailwind)

- Se **importa solo `bootstrap-grid.min.css` y `bootstrap-utilities.min.css`** (sin estilos de componentes de Bootstrap: no hay buttons, cards, navbars nativos de BS).
- Clases usadas: `container`, `row`, `col-*`, `d-flex`, `gap-*`, `mt-*`, `mb-*`, etc.
- Tailwind complementa con utilidades de color, tipografía, sombras, animaciones y clases de tema oscuro.
- Optimizado para **1920×1080** (container amplio, `col-xxl-9` para no "apretar" el contenido).
- Correctamente adaptable a **tablet** (`col-md-*`) y **mobile** (`col-12`).

---

## ⚙️ Decisiones técnicas de diseño

### Atomización del código
- **Cada componente tiene una única responsabilidad** (SRP):
  - `EjercicioWrapper` se ocupa de la tarjeta común (encabezado + contenido).
  - `FormularioTarea` solo maneja el input + submit de tarea nueva.
  - `TareaItem` solo renderiza una fila de tarea.
  - `Modal.jsx` es genérico y reutilizable por cualquier componente.
  - `ThemeToggle.jsx` encapsula el botón del tema.
- La lógica pura va en `/Scripts/helpers.js` (sin React), para ser testeable y reusable.

### Manejo del tema claro/oscuro
- **Context API** como única fuente de verdad (no se pasa el tema por props en cadena).
- `ThemeProvider` en `main.jsx` envuelve todo el árbol.
- `useEffect` dentro del provider sincroniza:
  1. La clase `.dark` en `<html>` (para Tailwind).
  2. El valor en `localStorage` (persistencia entre refrescos).
- Fallback elegante: si no hay valor guardado, respeta la preferencia del sistema (`prefers-color-scheme`).
- Componentes consumen el tema via hook `useTheme()` (DRY).

### Bootstrap + Tailwind
- **Bootstrap se limita a su sistema de grid/utilidades** (carga mínima: ~25 kB gz).
- **Tailwind hace todo lo visual**: colores, tipografía, sombras, bordes, animaciones, tema oscuro.
- `tailwind.config.js` tiene `corePlugins.preflight = false` para evitar conflictos con el reset de Bootstrap.
