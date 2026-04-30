# JS Arrays y Metodos - JS0

Este proyecto es una solución modular y profesional para la práctica de 14 métodos fundamentales de arrays en JavaScript. Diseñado bajo principios de atomización, modularidad (ES Modules) y buenas prácticas de desarrollo.

## Características

- **Arquitectura Modular**: Separación de responsabilidades en archivos específicos dentro de `/Modules`.
- **Funciones Atomizadas**: Cada función realiza una única tarea, facilitando su testeo y reutilización.
- **Validación de Datos**: Todas las funciones verifican que los parámetros de entrada sean correctos (ej. `Array.isArray`).
- **Interfaz Profesional**: UI construida con **Bootstrap 5**, responsive y estética.
- **Sin Alertas**: Los resultados se visualizan directamente en la interfaz y en la consola del desarrollador.
- **Servidor Node.js**: Incluye un servidor básico con Express para servir los archivos estáticos correctamente.

## Estructura del Proyecto

```plaintext
/Project-Root
│   server.js           # Servidor Express (Entry point)
│   package.json        # Configuración y dependencias (Type: Module)
│   README.md           # Documentación
├── /Pages
│   └── index.html      # Estructura principal
├── /Scripts
│   └── main.js         # Orquestador principal
├── /Styles
│   └── custom.css      # Estilos personalizados
└── /Modules            # Lógica de negocios atomizada
    ├── pushPop.js
    ├── shiftUnshift.js
    ├── spliceSlice.js
    ├── searchMethods.js
    ├── iterationMethods.js
    └── transformMethods.js
```

## Instalación y Uso

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor:
   ```bash
   npm start
   ```
4. Abrir en el navegador: `http://localhost:3000`

## Métodos Cubiertos (14 Categorías)

1.  **Añadir/Eliminar (Final):** `push()`, `pop()`
2.  **Añadir/Eliminar (Inicio):** `shift()`, `unshift()`
3.  **Manipulación:** `splice()`, `slice()`
4.  **Búsqueda:** `indexOf()`, `includes()`
5.  **Iteración:** `forEach()`, `map()`, `filter()`
6.  **Transformación:** `reduce()`, `sort()`, `reverse()`
