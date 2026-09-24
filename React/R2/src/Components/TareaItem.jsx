import { Link } from 'react-router-dom';
import EstadoBadge from './EstadoBadge.jsx';
import { formatearFecha, truncarTexto } from '../Scripts/utils.js';

/**
 * Item de tarea individual para el listado de la Home.
 * Representa una tarjeta clickeable que navega al detalle.
 * @component
 * @param {Object} props - Props del componente
 * @param {Object} props.tarea - Objeto tarea completo
 * @param {string} props.tarea.id - Id único de la tarea
 * @param {string} props.tarea.titulo - Título de la tarea
 * @param {string} props.tarea.descripcion - Descripción completa
 * @param {string} props.tarea.fechaCreacion - Fecha ISO de creación
 * @param {boolean} props.tarea.completa - Estado de completitud
 */
function TareaItem({ tarea }) {
  const { id, titulo, descripcion, fechaCreacion, completa } = tarea;

  return (
    <Link
      to={`/tarea/${id}`}
      className="card-tarea text-decoration-none text-inherit d-block h-100"
      aria-label={`Ver detalle de: ${titulo}`}
    >
      <article className="h-100 d-flex flex-column gap-3">
        <header className="d-flex justify-content-between align-items-start gap-3">
          <h2 className="fs-5 fw-bold m-0 flex-grow-1 line-clamp-1">
            {titulo}
          </h2>
          <EstadoBadge completa={completa} />
        </header>

        <p className="fs-6 flex-grow-1 m-0 opacity-90">
          {truncarTexto(descripcion, 150)}
        </p>

        <footer className="pt-2 border-top opacity-75 fs-6 d-flex justify-content-between align-items-center">
          <time dateTime={fechaCreacion}>{formatearFecha(fechaCreacion)}</time>
          <span className="d-none d-sm-inline">Ver detalle →</span>
        </footer>
      </article>
    </Link>
  );
}

export default TareaItem;
