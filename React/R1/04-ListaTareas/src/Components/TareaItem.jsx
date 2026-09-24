import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Subcomponente atómico: ítem individual de la lista de tareas.
 * Renderiza una tarea con su texto, un checkbox visual (estilo tachado) y un botón de eliminar
 * que NO borra directamente, sino que pide confirmación al padre.
 *
 * @param {Object} props
 * @param {{id:number,texto:string,completada:boolean}} props.tarea - Datos de la tarea
 * @param {Function} props.onToggleCompletada - Callback (id) => void para alternar estado
 * @param {Function} props.onSolicitarEliminar - Callback (id) => void para pedir confirmación de borrado
 */
export default function TareaItem({ tarea, onToggleCompletada, onSolicitarEliminar }) {
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
        onClick={() => onSolicitarEliminar(tarea.id)}
        aria-label="Eliminar tarea"
        title="Eliminar tarea"
        className={`flex-shrink-0 d-inline-flex align-items-center justify-content-center rounded transition-all duration-200 border-0
          ${isDark
            ? 'bg-dark-gris/50 text-dark-crema/70 hover:bg-dark-borgona hover:text-dark-crema'
            : 'bg-light-beige/50 text-light-marron/70 hover:bg-red-100 hover:text-red-700'
          }`}
        style={{ width: '32px', height: '32px' }}
      >
        🗑️
      </button>
    </li>
  );
}
