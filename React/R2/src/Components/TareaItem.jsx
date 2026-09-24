import { Link } from 'react-router-dom';
import EstadoBadge from './EstadoBadge.jsx';
import { formatearFecha, truncarTexto } from '../Scripts/utils.js';
import { useTareas } from '../Context/TareasContext.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';

function TareaItem({ tarea }) {
  const { id, titulo, descripcion, fechaCreacion, completa } = tarea;
  const { toggleCompleta } = useTareas();
  const { esOscuro } = useTheme();

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompleta(id);
  };

  return (
    <div className={`tarea-card h-100 ${completa ? 'is-completa' : ''}`}>
      <div className={`tarea-indicador ${esOscuro ? 'oscuro' : 'claro'}`} aria-hidden="true" />
      <Link
        to={`/tarea/${id}`}
        className="tarea-content text-decoration-none text-inherit d-block h-100"
        aria-label={`Ver detalle de: ${titulo}`}
      >
        <article className="h-100 d-flex flex-column gap-3 py-4 pe-4 ps-3">
          <header className="d-flex gap-3 align-items-start">
            <button
              type="button"
              onClick={handleToggle}
              className={`tarea-checkbox flex-shrink-0 mt-1 ${
                completa ? 'checked' : ''
              } ${esOscuro ? 'oscuro' : 'claro'}`}
              aria-label={completa ? 'Marcar como pendiente' : 'Marcar como completa'}
            >
              {completa && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div className="flex-grow-1 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <h2 className={`fs-6 fw-bold m-0 line-clamp-2 ${completa ? 'text-decoration-none tachado' : ''}`}>
                  {titulo}
                </h2>
                <EstadoBadge completa={completa} />
              </div>

              <p className={`fs-6 flex-grow-1 m-0 lh-base line-clamp-3 ${completa ? 'opacity-60' : 'opacity-85'}`}>
                {truncarTexto(descripcion, 160)}
              </p>
            </div>
          </header>

          <footer className="pt-2 mt-auto d-flex justify-content-between align-items-center gap-2 ms-5">
            <div className="d-flex align-items-center gap-2 opacity-70 fs-6">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 4V8L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <time dateTime={fechaCreacion}>{formatearFecha(fechaCreacion)}</time>
            </div>
            <div className="d-flex align-items-center gap-1 tarea-ver-detalle">
              <span className="fs-6 opacity-80">Abrir</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </footer>
        </article>
      </Link>
    </div>
  );
}

export default TareaItem;
