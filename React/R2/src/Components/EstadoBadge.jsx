import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Badge visual que indica si una tarea está completa o incompleta.
 * Diferencia por color y texto según estado.
 * @component
 * @param {Object} props - Props del componente
 * @param {boolean} props.completa - Estado de completitud de la tarea
 */
function EstadoBadge({ completa }) {
  const { esOscuro } = useTheme();

  if (completa) {
    return (
      <span
        className={`badge fs-6 px-3 py-1 ${
          esOscuro ? 'bg-otoño-oscuro-mostaza text-otoño-oscuro-chocolate' : 'bg-otoño-claro-oliva text-white'
        }`}
        role="status"
        aria-label="Tarea completa"
      >
        ✓ Completa
      </span>
    );
  }

  return (
    <span
      className={`badge fs-6 px-3 py-1 ${
        esOscuro ? 'bg-otoño-oscuro-borgoña text-otoño-claro-crema' : 'bg-otoño-claro-terracota text-white'
      }`}
      role="status"
      aria-label="Tarea incompleta"
    >
      ⏳ Pendiente
    </span>
  );
}

export default EstadoBadge;
