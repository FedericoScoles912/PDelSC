import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Envoltorio reutilizable para cada ejercicio.
 * Aplica estilos comunes (card, sombra, padding, título, descripción).
 *
 * @param {Object} props
 * @param {number} props.numero - Número del ejercicio (1..5)
 * @param {string} props.titulo - Título visible del ejercicio
 * @param {string} props.descripcion - Explicación breve del ejercicio
 * @param {import('react').ReactNode} props.children - Contenido del ejercicio
 */
export default function EjercicioWrapper({ numero, titulo, descripcion, children }) {
  const { isDark } = useTheme();

  return (
    <section className="card-base overflow-hidden">
      <header
        className={`px-4 px-md-5 py-4 border-bottom
          ${isDark ? 'border-dark-mostaza/30 bg-dark-gris/30' : 'border-light-marron/30 bg-light-beige/50'}`}
      >
        <div className="d-flex flex-wrap align-items-center gap-3">
          <span
            className={`d-inline-flex align-items-center justify-content-center rounded-circle fw-bold
              ${isDark ? 'bg-dark-mostaza text-dark-chocolate' : 'bg-light-terracota text-light-crema'}`}
            style={{ width: '38px', height: '38px' }}
          >
            {numero}
          </span>
          <div>
            <h2 className="titulo m-0">{titulo}</h2>
            <p className={`m-0 mt-1 text-sm ${isDark ? 'text-dark-crema/80' : 'text-light-oliva/90'}`}>
              {descripcion}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 p-md-5">
        {children}
      </div>
    </section>
  );
}
