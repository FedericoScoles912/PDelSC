# Proyecto Frontend - Gestión de Alumnos

## 📋 Descripción
Proyecto frontend completo para la gestión de alumnos, con dos interfaces diferentes: una usando la Fetch API nativa y otra usando Axios.

## ⚠️ Importante
Este proyecto depende del proyecto backend corriendo en http://localhost:3000. Asegúrate de tener el servidor backend activo antes de usar este frontend.

## 🚀 Instrucciones de uso

### 1. Iniciar el backend
Primero, asegúrate de tener el servidor backend corriendo:
- Navega a la carpeta del backend
- Ejecuta `npm install` (si es la primera vez)
- Ejecuta `node server.js`

### 2. Abrir el frontend
Abre el archivo `index.html` en tu navegador. Puedes:
- Hacer doble clic en el archivo
- Usar una extensión de servidor live (como Live Server en VS Code)

### 3. Usar la aplicación
- Desde la página de inicio, elige entre la versión con Fetch API o con Axios
- Ambas versiones tienen las mismas funcionalidades:
  - Agregar alumnos
  - Editar alumnos
  - Eliminar alumnos
  - Ver la lista de alumnos

## 📁 Estructura del proyecto

```
proyecto-frontend/
├── index.html                  # Página de inicio
├── pages/
│   ├── fetch.html              # Interfaz con Fetch API
│   └── axios.html              # Interfaz con Axios
├── scripts/
│   ├── fetch.js                # Lógica con Fetch API
│   └── axios.js                # Lógica con Axios
├── styles/
│   └── main.css                # Estilos comunes
└── README.md                   # Este archivo
```

## 🎨 Características
- Modo claro/oscuro (persistente en localStorage)
- Validaciones estrictas en cliente y servidor
- Notificaciones toast
- Confirmación de eliminación inline
- Diseño responsive
- Uso de createElement y textContent para seguridad
