# Proyecto List - Leaderboard de Alumnos

Proyecto que muestra un leaderboard de alumnos, consumiendo la API del proyecto Forms.

## Estructura del Proyecto
```
list/
├── pages/
│   └── index.html
├── scripts/
│   └── main.js
├── styles/
│   └── main.css
└── README.md
```

## Requisitos
- El proyecto `forms` debe estar corriendo en `http://localhost:3001`
- Navegador web

## Instrucciones de Uso

1. **Asegúrate de que el proyecto Forms esté corriendo**
   - Ve a la carpeta `forms` y ejecuta `npm start`
   - Verifica que el servidor esté en `http://localhost:3001`

2. **Abrir la Aplicación**
   - Abre el archivo `pages/index.html` directamente en tu navegador
   - O abre un servidor simple (por ejemplo, con Live Server en VS Code)

## Funcionalidades
- Leaderboard de alumnos (ordenados por edad de mayor a menor)
- Medallas para los primeros 3 lugares
- Botón para actualizar la lista
- Modo claro/oscuro
- Notificaciones toast

## Tecnologías
- JavaScript ES Modules
- CSS (variables, responsive design, gradientes)
- Fetch API (para consumir la API del proyecto Forms)
