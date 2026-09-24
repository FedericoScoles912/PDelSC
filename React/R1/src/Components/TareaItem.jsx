import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Subcomponente atómico: ítem individual de la lista de tareas.
 * Renderiza una tarea con su texto y un checkbox visual (estilo tachado).
 *
 * @param {Object} props
 * @param {{id:number,texto:string,completada:boolean}} props.tarea - Datos de la tarea
 * @param {Function} props.onToggleCompletada - Callback (id) => void para alternar estado
 * @param {Function} props.onEliminar - Callback (id) => void para eliminar tarea
 */
export default function TareaItem({ tarea, onToggleCompletada, onEliminar }) {
  const { isDark } = useTheme();

  return (
    <li
      className={`d-flex align-items-center gap-3 p-3 rounded-lg border transition-all duration-200 animate-fade-in
        ${tarea.completada
          ? isDark
            ? 'bg-dark-gris/30 border-dark-mostaza/20'
            : 'bg-light-beige/50 border-light-marron/20'
          : isDark
            ? 'bg-dark-chocolate border-dark-mostaza/40 hover:border-dark-mostaza/80'
            : 'bg-light-crema border-light-marron/40 hover:border-light-terracota/80'
        }`}
    >
      <button
        type="button"
        onClick={() => onToggleCompletada(tarea.id)}
        aria-label={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
        className={`flex-shrink-0 d-inline-flex align-items-center justify-content-center rounded transition-all duration-200 border-0
          ${tarea.completada
            ? isDark
              ? 'bg-dark-mostaza text-dark-chocolate'
              : 'bg-light-terracota text-light-crema'
            : isDark
              ? 'bg-dark-gris border-2 border-dark-mostaza/50 text-transparent hover:border-dark-mostaza'
              : 'bg-light-crema border-2 border-light-marron/50 text-transparent hover:border-light-terracota'
          }`}
        style={{ width: '26px', height: '26px' }}
      >
        ✓
      </button>

      <button
        type="button"
        onClick={() => onToggleCompletada(tarea.id)}
        className={`flex-grow-1 text-start border-0 bg-transparent p-0 texto-claro lh-base
          ${tarea.completada ? 'text-decoration-line-through opacity-60' : ''}`}
      >
        {tarea.texto}
      </button>

      <button
        type="button"
        onClick={() => onEliminar(tarea.id)}
        aria-label="Eliminar tarea"
        className={`flex-shrink-0 border-0 bg-transparent fs-5 transition-colors duration-200
          ${isDark ? 'text-dark-crema/60 hover:text-red-400' : 'text-light-oliva/60 hover:text-red-500'}`}
      >
        ✕
      </button>
    </li>
  );
}
