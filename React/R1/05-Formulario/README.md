# 🍂 Ejercicio 5 · Formulario simple | React

Proyecto standalone del **Ejercicio 5** de React: formulario con input controlado, validación de solo letras y modal propio (sin `alert()`). Construido con **Vite**, **TailwindCSS** (paleta otoñal) y **Bootstrap** (solo grid/utilidades responsive). Incluye modo claro/oscuro persistente con Context API + localStorage.

---

## 🚀 Instalación y uso

```bash
# Entrar en la carpeta del proyecto
cd 05-Formulario

# 1. Instalar dependencias
npm install

# 2. Levantar entorno de desarrollo (Vite)
npm run dev
# Abre http://localhost:5179

# 3. Build para producción
npm run build
# Genera /dist

# 4. Previsualizar el build
npm run preview

# 5. Servidor Express (sirve /dist)
npm start
# Abre http://localhost:3005
```

---

## 🧩 Descripción del ejercicio

**Formulario input controlado** con `useState` que captura el nombre de usuario:

- ✅ **Input controlado**: el valor del input siempre está sincronizado con el estado de React.
- ✅ **Modal propio sin alert()**: componente `Modal.jsx` reutilizable con 3 variantes (éxito, error, advertencia).
- ✅ **VALIDACIÓN SOLO LETRAS**: solo se aceptan letras (mayúsculas/minúsculas), espacios, tildes, ñ, ü, guiones y apóstrofes.
  - **Sanitización onInput**: a medida que el usuario escribe, se filtran y eliminan automáticamente los caracteres inválidos (números, símbolos).
  - **Validación doble**: al enviar el formulario se vuelve a validar.
- ✅ **Error inline**: mensaje debajo del input cuando se intenta escribir caracteres inválidos, con estilo `input-invalido` (borde rojo).
- ✅ **Modal de 3 variantes**:
  - ⚠️ **Advertencia**: cuando el input está vacío al enviar.
  - ❌ **Error**: cuando el nombre contiene caracteres inválidos.
  - ✅ **Éxito**: cuando el formulario se envía correctamente, mostrando el nombre capitalizado.
- ✅ **Contador 40 chars**: límite máximo de caracteres en el input, con contador visible.
- ✅ **Cierre del modal**: por botón, click fuera del modal o tecla **Escape**.
- ✅ **Botón Limpiar**: resetea el formulario y los errores.

---

## 🗂 Estructura de carpetas

```
05-Formulario/
├── server.js                  # Servidor Express para producción (puerto 3005)
├── package.json
├── vite.config.js             # Vite (puerto 5179)
├── tailwind.config.js         # Paleta otoñal extendida
├── postcss.config.js
├── .gitignore
├── index.html                 # <title>Ej 5 · Formulario | React</title>
└── src/
    ├── main.jsx               # Punto de entrada + ThemeProvider
    ├── App.jsx                # LayoutApp + FormularioSimple (sin navegación)
    ├── Context/
    │   └── ThemeContext.jsx   # Modo claro/oscuro (Context API + localStorage)
    ├── Layouts/
    │   ├── Header.jsx         # Navbar simplificado (título + ThemeToggle)
    │   └── LayoutApp.jsx      # Layout principal (header/main/footer)
    ├── Components/
    │   ├── FormularioSimple.jsx   # Ejercicio 5 (formulario + validación)
    │   ├── Modal.jsx              # Modal/Toast propio (3 variantes)
    │   ├── EjercicioWrapper.jsx   # Card común al ejercicio
    │   └── ThemeToggle.jsx        # Botón sol/luna del tema
    ├── Scripts/
    │   └── helpers.js             # capitalizar(), SOLO_LETRAS_REGEX, filtrarSoloLetras(), esSoloLetras()
    ├── Styles/
    │   ├── index.css              # Tailwind + Bootstrap utilities + @layer (input-invalido, focus ring)
    │   ├── tema-claro.css
    │   └── tema-oscuro.css
    └── Assets/                # Imágenes / íconos
```

---

## 🌓 Modo claro / oscuro

- Implementado con **Context API** (`/Context/ThemeContext.jsx`).
- Persistencia en **localStorage** (`app-tema-oton`).
- Detecta `prefers-color-scheme` del navegador en la carga inicial.
- Aplica la clase `.dark` en `<html>` para que Tailwind funcione con `darkMode: 'class'`.
- Toggle visible en el navbar (botón sol/luna).

---

## 📐 Responsive (Bootstrap + Tailwind)

- Se **importa solo `bootstrap-grid.min.css` y `bootstrap-utilities.min.css`** (sin estilos de componentes de Bootstrap).
- Tailwind complementa con utilidades de color, tipografía, sombras, animaciones y clases de tema oscuro.
- Correctamente adaptable a **desktop**, **tablet** y **mobile**.
