# Ejercicio 3 · Contador | React + Vite + TailwindCSS

Ejercicio 3 de la serie de prácticas progresivas con React.

## Funcionalidad

Contador interactivo implementado con `useState`:
- Valor inicial: **0**
- Valor mínimo: **0**
- Valor máximo: **999**
- Botón **+** para incrementar (deshabilitado en el máximo)
- Botón **−** para decrementar (deshabilitado en el mínimo)
- Botón **Reset** para volver a 0
- Función `clamp` para garantizar que el valor nunca salga del rango permitido

## Comandos

```bash
cd 03-Contador
npm install
npm run dev    # Vite en http://localhost:5177
npm run build  # Genera dist/
npm start      # Express sirve dist/ en http://localhost:3003
```
