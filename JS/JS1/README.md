# Proyecto JavaScript - Portafolio

Proyecto web completo desarrollado con JavaScript Vanilla, HTML5, CSS3 y Bootstrap 5. Incluye navegación SPA, modo oscuro/claro y 3 proyectos interactivos con formularios validados y almacenamiento en localStorage.

## Tecnologías Utilizadas

- **HTML5** - Estructura del sitio
- **CSS3** - Estilos y animaciones
- **JavaScript Vanilla (ES6+)** - Lógica de la aplicación
- **Bootstrap 5** - Componentes UI y grid system
- **localStorage** - Almacenamiento de datos

## Estructura de Carpetas

```plaintext
/JS1
├── index.html                 # Archivo principal
├── README.md                  # Este archivo
│
├── /css                       # Carpeta de estilos
│   ├── style.css              # Estilos principales
│   ├── responsive.css         # Estilos responsive
│   └── themes.css             # Modo claro/oscuro
│
├── /script                    # Carpeta de JavaScript
│   ├── app.js                 # Lógica principal de la app
│   ├── router.js              # Sistema de navegación SPA
│   ├── validations.js         # Validaciones de formularios
│   ├── storage.js             # Manejo de localStorage
│   ├── ui.js                  # Funciones de interfaz
│   └── forms.js               # Manejo de formularios
│
├── /pages                     # Páginas del proyecto
│   ├── proyecto1.html         # Proyecto 1 - Usuarios
│   ├── proyecto2.html         # Proyecto 2 - Productos
│   └── proyecto3.html         # Proyecto 3 - Personas
│
├── /data                      # Datos
│   └── ejemplos.json          # Ejemplo de archivo JSON
│
└── /assets                    # Recursos
    ├── /img                   # Imágenes
    └── /icons                 # Íconos
```

## Cómo Ejecutar el Proyecto

1. Clona o descarga el repositorio
2. Abre el archivo `index.html` en tu navegador web preferido
3. ¡Listo! Comienza a explorar los proyectos

## Funcionalidades Principales

### 1. Navegación SPA (Single Page Application)

El sitio utiliza JavaScript para navegar entre páginas sin recargar el navegador. Esto se logra mediante:
- Uso de hash en la URL (#/ruta)
- Carga dinámica de contenido con fetch()
- innerHTML para actualizar la vista

### 2. Modo Claro/Oscuro

- Cambia entre temas con un solo clic
- El tema seleccionado se guarda en localStorage
- Persiste incluso después de cerrar el navegador

### 3. Validaciones de Formularios

TODOS los formularios incluyen validaciones estrictas:
- Campos obligatorios
- Longitud mínima y máxima
- Formato de email
- Solo números o letras
- Fechas válidas
- Edad válida
- Teléfono válido
- Documento válido
- Mensajes de error/success dinámicos usando Bootstrap Alerts y estilos inline

### 4. localStorage

Todos los datos se guardan en el almacenamiento local del navegador:
- Usuarios (Proyecto 1)
- Productos (Proyecto 2)
- Personas (Proyecto 3)
- Preferencia de tema

## Proyectos

### Proyecto 1 - Usuarios

**Objetivo:** Demostrar las 3 formas de lectura de formularios en JavaScript:
1. getElementById
2. querySelector
3. FormData

**Funcionalidades:**
- Formulario de carga de usuario
- Lista dinámica de usuarios en Cards Bootstrap
- Eliminar usuarios
- Validaciones completas

### Proyecto 2 - Productos

**Objetivo:** Mostrar datos dinámicamente desde un formulario con CRUD completo.

**Campos del formulario:**
- Nombre del producto
- Categoría (Deportes, Tecnología, Hogar, Moda, Alimentos)
- Marca
- Precio
- Stock
- Descripción

**Funcionalidades:**
- Agregar productos
- Editar productos
- Eliminar productos
- Buscador dinámico
- Mostrar datos en Tabla y Cards Bootstrap
- Uso de métodos de arrays: push(), map(), filter()
- Almacenamiento en localStorage

### Proyecto 3 - Personas

**Objetivo:** Sistema completo de almacenamiento de personas con localStorage.

**Campos obligatorios:**
- Nombre
- Apellido
- Edad
- Fecha de nacimiento
- Sexo (Masculino/Femenino)
- Documento
- Estado civil
- Nacionalidad
- Teléfono
- Email
- Hijos (con campo dinámico para cantidad)
- Dirección
- Ciudad

**Funcionalidades:**
- Guardar personas
- Editar personas
- Eliminar personas (con confirmación Modal)
- Buscador dinámico
- Validaciones completas
- Almacenamiento en localStorage

## Archivos JavaScript y su Funcionalidad

### storage.js
Maneja todas las operaciones con localStorage:
- `save(key, data)` - Guarda datos
- `load(key, defaultValue)` - Carga datos
- `remove(key)` - Elimina un item
- `clear()` - Limpia todo el storage
- `getTheme()` / `setTheme()` - Manejo del tema
- `toggleTheme()` - Cambia entre claro/oscuro

### validations.js
Contiene todas las funciones de validación:
- `isEmpty()` - Verifica si un campo está vacío
- `hasMinLength()` / `hasMaxLength()` - Longitud
- `isValidEmail()` - Valida email
- `isOnlyNumbers()` / `isOnlyLetters()` - Tipo de caracteres
- `isValidDate()` / `isValidAge()` - Fechas y edad
- `isValidPhone()` / `isValidDocument()` - Teléfono y documento
- `validateField()` - Valida un campo individual
- `validateForm()` - Valida un formulario completo
- `setFieldValidation()` - Aplica estilos de validación

### ui.js
Funciones de interfaz de usuario:
- `showAlert()` - Muestra alertas Bootstrap
- `clearAlerts()` - Limpia alertas
- `showConfirm()` - Muestra modal de confirmación
- `generateId()` - Genera IDs únicos
- `formatDate()` - Formatea fechas
- `escapeHtml()` - Escapa HTML para seguridad

### forms.js
Manejo de formularios:
- `getElementById()` - Lee campo por ID
- `getQuerySelector()` - Lee campo por selector
- `getFormData()` - Lee todo el formulario con FormData
- `reset()` - Reinicia el formulario
- `fill()` - Llena el formulario con datos

### router.js
Sistema de rutas SPA:
- `register(path, handler)` - Registra una ruta
- `navigate(path)` - Navega a una ruta
- `init()` - Inicializa el router
- `loadPage()` - Carga contenido de archivos HTML

### app.js
Lógica principal de la aplicación:
- `init()` - Inicializa la app
- Manejo de los 3 proyectos
- CRUD de usuarios, productos y personas
- Renderizado de vistas

## Responsive Design

El sitio es completamente responsive para:
- **Desktop** - Ancho completo
- **Tablet** - 768px
- **Mobile** - 576px

## Calidad del Código

- Código limpio y bien estructurado
- Modular y reutilizable
- Comentarios claros en JavaScript
- Uso de ES6+ (arrow functions, destructuring, template literals)
- Variables CSS en themes.css
- Animaciones suaves con CSS transitions

## Autor

Proyecto desarrollado como portafolio de JavaScript Vanilla.
