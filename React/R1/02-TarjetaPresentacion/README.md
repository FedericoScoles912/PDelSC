# Ejercicio 2 · Tarjeta de Presentación | React

Ejercicio standalone de React que implementa un componente reutilizable de tarjeta de presentación.

## Instalación y ejecución

```bash
cd 02-TarjetaPresentacion
npm install
npm run dev        # Modo desarrollo en puerto 5176
# o
npm run build && npm start   # Build + servidor Express en puerto 3002
```

## Descripción del ejercicio

Componente `TarjetaPresentacion` que recibe las siguientes **props**:
- `nombre` — Nombre de la persona
- `apellido` — Apellido de la persona
- `profesion` — Cargo o profesión
- `imagen` — URL de la foto de perfil

Características visuales:
- Foto de perfil **circular** con borde y halo de sombra
- Tarjeta con **sombra** suave
- Efecto **hover**: elevación + sombra más intensa
- Tema claro/oscuro (paleta otoñal) con persistencia en localStorage
- 3 personas de ejemplo con imágenes de Unsplash

## Tecnologías

- React 18
- Vite 5
- TailwindCSS 3 (paleta otoñal, dark mode por clase)
- Bootstrap 5.3 (grid + utilities)
- Express 4 (servidor de producción)
