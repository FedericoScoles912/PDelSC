import { useParams, Link } from 'react-router-dom';
import { useTareas } from '../Context/TareasContext.jsx';
import BotonVolver from '../Components/BotonVolver.jsx';
import EstadoBadge from '../Components/EstadoBadge.jsx';
import { formatearFecha } from '../Scripts/utils.js';
import { useTheme } from '../Context/ThemeContext.jsx';
import { useToast } from '../Context/ToastContext.jsx';

/**
 * Página de detalle de una tarea.
 * Obtiene el :id de la URL mediante useParams() y busca la tarea en el contexto.
 * Maneja el caso de id inválido/inexistente.
 * @component
 */
function Detalle() {
  const { id } = useParams();
  const { obtenerTareaPorId, toggleCompleta, eliminarTarea } = useTareas();
  const { esOscuro } = useTheme();
  const { mostrarToast } = useToast();

  const tarea = obtenerTareaPorId(id);

  if (!tarea) {
    return (
      <section className="d-flex flex-column align-items-center text-center py-5 gap-4">
        <div className="fs-1" aria-hidden="true">🔍</div>
        <h1 className="fs-2 fw-bold m-0">Tarea no encontrada</h1>
        <p className="fs-6 opacity-85 max-w-md m-0">
          No existe ninguna tarea con el identificador <code className="fw-bold">{id}</code>.
          Es posible que haya sido eliminada o que el enlace sea incorrecto.
        </p>
        <div className="d-flex gap-3 flex-wrap justify-content-center mt-2">
          <BotonVolver to="/" texto="Volver al inicio" variante="primario" />
          <Link to="/crear" className="btn-ghost text-decoration-none">
            Crear nueva tarea
          </Link>
        </div>
      </section>
    );
  }

  const handleToggleCompleta = () => {
    toggleCompleta(tarea.id);
    mostrarToast({
      mensaje: tarea.completa ? 'Tarea marcada como pendiente' : '¡Tarea completada!',
      tipo: 'exito'
    });
  };

  const handleEliminar = () => {
    if (window.confirm === undefined) return;
    const confirmar = confirmarEliminacion(tarea.titulo);
    if (confirmar) {
      eliminarTarea(tarea.id);
      mostrarToast({ mensaje: 'Tarea eliminada correctamente', tipo: 'info' });
    }
  };

  return (
    <section className="d-flex flex-column gap-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <BotonVolver to="-1" texto="Volver" />
        <EstadoBadge completa={tarea.completa} />
      </div>

      <article
        className={`card-base ${
          esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white'
        }`}
      >
        <header className="border-bottom pb-4 mb-4">
          <h1 className="fs-1 fw-bold mb-3">{tarea.titulo}</h1>
          <div className="d-flex flex-wrap gap-4 fs-6 opacity-85">
            <div className="d-flex align-items-center gap-2">
              <span aria-hidden="true">📅</span>
              <span>
                Creada el: <strong>{formatearFecha(tarea.fechaCreacion)}</strong>
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span aria-hidden="true">🆔</span>
              <span>
                ID: <code className="fw-bold">{tarea.id.slice(0, 8)}...</code>
              </span>
            </div>
          </div>
        </header>

        <section className="mb-5">
          <h2 className="fs-4 fw-bold mb-3">Descripción</h2>
          <p className="fs-6 lh-lg opacity-95 m-0 whitespace-pre-wrap">
            {tarea.descripcion}
          </p>
        </section>

        <footer className="pt-4 border-top d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleToggleCompleta}
              className={tarea.completa ? 'btn-ghost' : 'btn-secundario'}
            >
              {tarea.completa ? 'Marcar como pendiente' : 'Marcar como completa'}
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="btn-primario"
              style={
                esOscuro
                  ? { backgroundColor: '#6B3A3E', color: '#FAF6EC' }
                  : { backgroundColor: '#C97B5E', color: '#fff' }
              }
            >
              Eliminar tarea
            </button>
          </div>
          <Link
            to="/crear"
            className="btn-ghost text-decoration-none"
          >
            Crear otra tarea →
          </Link>
        </footer>
      </article>
    </section>
  );
}

/**
 * Muestra un diálogo de confirmación nativo (no alert) para eliminar.
 * @param {string} titulo - Título de la tarea a eliminar
 * @returns {boolean} true si el usuario confirma
 */
function confirmarEliminacion(titulo) {
  const msj = `¿Estás seguro que querés eliminar la tarea "${titulo}"?\n\nEsta acción no se puede deshacer.`;
  if (typeof window !== 'undefined' && window.confirm) {
    return window.confirm(msj);
  }
  return true;
}

export default Detalle;
