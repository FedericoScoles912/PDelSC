# Ejercicio 1 · Hola Mundo | React

Primer ejercicio de React: componente "Hola Mundo" mostrado en 3 variantes de estilos distintas usando TailwindCSS.

## Instalación y uso

```bash
cd 01-HolaMundo
npm install
npm run dev       # Desarrollo → http://localhost:5175
npm run build     # Generar build en dist/
npm start         # Producción → Express sirve dist/ en puerto 3001
```

## Descripción del ejercicio

Componente `HolaMundo.jsx` sin estado interno que renderiza el clásico "¡Hola, mundo!" en tres variantes visuales:

1. **Variante 1**: Tipografía grande (`fs-1`) y color sólido.
2. **Variante 2**: Cursiva con animación `pulse` lenta.
3. **Variante 3**: Texto con gradiente y animación `bounce` lenta.

Incluye tema claro/oscuro (paleta otoñal), persistencia en localStorage y respeto por `prefers-color-scheme`.
