# Ejercicio 4 · Lista de Tareas (React)

Lista de tareas interactiva (Todo List) hecha con React 18 + Vite + TailwindCSS + Bootstrap Grid.

## Características del ejercicio

- `useState` para gestionar un array de objetos tarea `{ id, texto, completada }`.
- Subcomponentes:
  - **`FormularioTarea`**: input controlado + botón para agregar tareas.
  - **`TareaItem`**: ítem individual con checkbox visual, tachado y botón de eliminar.
- **`ListaTareas`**: orquesta el estado, renderiza el formulario, la lista y un mensaje vacío.
- Contador de progreso (total / completadas / porcentaje).
- Acciones: agregar, marcar como completada/pendiente, eliminar.
- Paleta otoñal + tema claro/oscuro con persistencia en `localStorage`.

## Cómo ejecutar

```bash
cd 04-ListaTareas
npm install
```

- Desarrollo (Vite HMR): **`npm run dev`** → http://localhost:5178
- Build de producción: **`npm run build`** → genera `dist/`
- Preview del build: **`npm run preview`**
- Servidor Express sirviendo `dist/`: **`npm start`** → http://localhost:3004
