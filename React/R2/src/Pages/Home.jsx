import { Link } from 'react-router-dom';
import { useTareas } from '../Context/TareasContext.jsx';
import TareaItem from '../Components/TareaItem.jsx';
import EstadoBadge from '../Components/EstadoBadge.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';
import { useToast } from '../Context/ToastContext.jsx';
import { useConfirm } from '../Context/ConfirmContext.jsx';

/**
 * Página de inicio: lista todas las tareas en una grilla responsive.
 * Muestra estadísticas (totales / completas / pendientes) y panel de
 * gestión rápida (acciones masivas sobre todo el listado).
 * @component
 */
function Home() {
  const {
    tareas,
    eliminarTodas,
    marcarTodas,
    eliminarCompletadas,
    restaurarIniciales
  } = useTareas();
  const { esOscuro } = useTheme();
  const { mostrarToast } = useToast();
  const { confirmar } = useConfirm();

  const totalTareas = tareas.length;
  const completas = tareas.filter((t) => t.completa).length;
  const pendientes = totalTareas - completas;

  const handleMarcarTodasCompletas = async () => {
    if (totalTareas === 0) return;
    const ok = await confirmar({
      titulo: 'Marcar todas como completas',
      mensaje: `¿Confirmás marcar las ${totalTareas} tarea(s) como completas?`,
      textoAceptar: 'Sí, marcar',
      textoCancelar: 'Cancelar',
      variante: 'info'
    });
    if (ok) {
      const n = marcarTodas(true);
      mostrarToast({
        mensaje: n > 0 ? `${n} tarea(s) marcada(s) como completa(s)` : 'Todas ya estaban completas',
        tipo: 'exito'
      });
    }
  };

  const handleMarcarTodasPendientes = async () => {
    if (totalTareas === 0) return;
    const ok = await confirmar({
      titulo: 'Marcar todas como pendientes',
      mensaje: `¿Confirmás marcar las ${totalTareas} tarea(s) como pendientes?`,
      textoAceptar: 'Sí, marcar',
      textoCancelar: 'Cancelar',
      variante: 'info'
    });
    if (ok) {
      const n = marcarTodas(false);
      mostrarToast({
        mensaje: n > 0 ? `${n} tarea(s) marcada(s) como pendiente(s)` : 'Todas ya estaban pendientes',
        tipo: 'exito'
      });
    }
  };

  const handleEliminarCompletadas = async () => {
    if (completas === 0) {
      mostrarToast({ mensaje: 'No hay tareas completadas para eliminar', tipo: 'info' });
      return;
    }
    const ok = await confirmar({
      titulo: 'Eliminar tareas completadas',
      mensaje: `Vas a borrar ${completas} tarea(s) completadas. Esta acción no se puede deshacer.`,
      textoAceptar: 'Sí, eliminar',
      textoCancelar: 'Cancelar',
      variante: 'peligro'
    });
    if (ok) {
      const n = eliminarCompletadas();
      mostrarToast({ mensaje: `${n} tarea(s) completada(s) eliminada(s)`, tipo: 'info' });
    }
  };

  const handleEliminarTodas = async () => {
    if (totalTareas === 0) {
      mostrarToast({ mensaje: 'El listado ya está vacío', tipo: 'info' });
      return;
    }
    const ok = await confirmar({
      titulo: '⚠️ Eliminar TODAS las tareas',
      mensaje: `Esto borrará PERMANENTEMENTE las ${totalTareas} tarea(s).\n\n¡Esta acción NO se puede deshacer!`,
      textoAceptar: 'Sí, borrar TODO',
      textoCancelar: 'Cancelar',
      variante: 'peligro'
    });
    if (ok) {
      const n = eliminarTodas();
      mostrarToast({ mensaje: `${n} tarea(s) eliminada(s). Listado vacío.`, tipo: 'info' });
    }
  };

  const handleRestaurarIniciales = async () => {
    const ok = await confirmar({
      titulo: 'Restaurar tareas iniciales',
      mensaje:
        'Se reemplazará el listado actual por las 10 tareas de ejemplo originales.\n\nSe perderán los cambios actuales.',
      textoAceptar: 'Sí, restaurar',
      textoCancelar: 'Cancelar',
      variante: 'info'
    });
    if (ok) {
      restaurarIniciales();
      mostrarToast({ mensaje: 'Listado restaurado al estado inicial', tipo: 'exito' });
    }
  };

  return (
    <section className="d-flex flex-column gap-5">
      <header className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-4">
        <div>
          <h1 className="fs-1 fw-bold m-0 mb-2">Mis Tareas</h1>
          <p className="m-0 fs-5 opacity-85">
            Gestioná tus pendientes de manera simple y ordenada.
          </p>
        </div>
        <Link
          to="/crear"
          className="btn-primario text-decoration-none d-inline-flex align-items-center gap-2 fs-5"
        >
          <span aria-hidden="true">+</span>
          Crear nueva tarea
        </Link>
      </header>

      <section className="row g-4">
        <div className="col-12 col-md-4">
          <div
            className={`card-base h-100 text-center ${
              esOscuro ? 'bg-otoño-oscuro-chocolateSuave text-otoño-claro-crema' : 'bg-white'
            }`}
          >
            <p className="fs-6 opacity-75 m-0 mb-1">Total</p>
            <p className="display-5 fw-bold m-0">{totalTareas}</p>
            <p className="fs-6 opacity-75 m-0 mt-1">tareas</p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div
            className={`card-base h-100 text-center ${
              esOscuro ? 'bg-otoño-oscuro-borgoña text-otoño-claro-crema' : 'bg-otoño-claro-beige'
            }`}
          >
            <p className="fs-6 opacity-75 m-0 mb-1">Pendientes</p>
            <p className="display-5 fw-bold m-0">{pendientes}</p>
            <p className="fs-6 opacity-75 m-0 mt-1">por completar</p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div
            className={`card-base h-100 text-center ${
              esOscuro ? 'bg-otoño-oscuro-mostaza text-otoño-oscuro-chocolate' : 'bg-otoño-claro-terracotaSuave'
            }`}
          >
            <p className="fs-6 opacity-90 m-0 mb-1">Completadas</p>
            <p className="display-5 fw-bold m-0">{completas}</p>
            <p className="fs-6 opacity-90 m-0 mt-1">
              {totalTareas ? Math.round((completas / totalTareas) * 100) : 0}%
            </p>
          </div>
        </div>
      </section>

      <section
        className={`card-base ${
          esOscuro ? 'bg-otoño-oscuro-grisCalido text-otoño-claro-crema' : 'bg-otoño-claro-crema'
        }`}
      >
        <header className="mb-4 d-flex align-items-center gap-3 flex-wrap justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center fs-4 ${
                esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white'
              }`}
              style={{ width: '44px', height: '44px' }}
              aria-hidden="true"
            >
              ⚡
            </div>
            <div>
              <h2 className="fs-4 fw-bold m-0">Gestión rápida</h2>
              <p className="fs-6 m-0 opacity-85">Acciones masivas sobre todo el listado</p>
            </div>
          </div>
          <span
            className={`badge fs-6 px-3 py-2 ${
              esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white text-otoño-oscuro-chocolate'
            }`}
          >
            {totalTareas} tarea(s) en el listado
          </span>
        </header>

        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <button
              type="button"
              onClick={handleMarcarTodasCompletas}
              disabled={totalTareas === 0}
              className="btn-secundario w-100 disabled:opacity-50 disabled:cursor-not-allowed d-flex align-items-center justify-content-center gap-2"
            >
              <span aria-hidden="true">✅</span>
              Marcar todas completas
            </button>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <button
              type="button"
              onClick={handleMarcarTodasPendientes}
              disabled={totalTareas === 0}
              className="btn-ghost w-100 disabled:opacity-50 disabled:cursor-not-allowed d-flex align-items-center justify-content-center gap-2"
            >
              <span aria-hidden="true">⏳</span>
              Marcar todas pendientes
            </button>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <button
              type="button"
              onClick={handleEliminarCompletadas}
              disabled={completas === 0}
              className="btn-ghost w-100 disabled:opacity-50 disabled:cursor-not-allowed d-flex align-items-center justify-content-center gap-2"
              style={
                esOscuro
                  ? { borderColor: '#A8882B' }
                  : { borderColor: '#A68A64' }
              }
            >
              <span aria-hidden="true">🧹</span>
              Limpiar completadas
            </button>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <button
              type="button"
              onClick={handleEliminarTodas}
              disabled={totalTareas === 0}
              className="w-100 disabled:opacity-50 disabled:cursor-not-allowed d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={
                esOscuro
                  ? { backgroundColor: '#6B3A3E', color: '#FAF6EC' }
                  : { backgroundColor: '#C97B5E', color: '#fff' }
              }
            >
              <span aria-hidden="true">🗑️</span>
              <strong>Eliminar TODO</strong>
            </button>
          </div>
          <div className="col-12">
            <button
              type="button"
              onClick={handleRestaurarIniciales}
              className="d-flex align-items-center gap-2 ms-auto mt-1 px-3 py-2 rounded-lg fs-6 opacity-80 hover:opacity-100 border-0 bg-transparent text-inherit text-decoration-underline"
            >
              <span aria-hidden="true">↩️</span>
              Restaurar tareas de ejemplo
            </button>
          </div>
        </div>
      </section>

      {totalTareas === 0 ? (
        <div
          className={`card-base text-center py-5 ${
            esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white'
          }`}
        >
          <div className="fs-1 mb-3" aria-hidden="true">📝</div>
          <h2 className="fs-3 fw-bold mb-2">Aún no tenés tareas</h2>
          <p className="fs-6 opacity-85 mb-4">
            Creá tu primera tarea para empezar a organizarte o restaurá los datos de ejemplo.
          </p>
          <div className="d-flex gap-3 flex-wrap justify-content-center">
            <Link
              to="/crear"
              className="btn-primario text-decoration-none d-inline-flex align-items-center gap-2"
            >
              <span aria-hidden="true">+</span>
              Crear primera tarea
            </Link>
            <button
              type="button"
              onClick={handleRestaurarIniciales}
              className="btn-ghost"
            >
              ↩️ Restaurar ejemplos
            </button>
          </div>
        </div>
      ) : (
        <section className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h2 className="fs-3 fw-bold m-0">Listado de tareas</h2>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <EstadoBadge completa={false} />
              <span className="opacity-75"> {pendientes}</span>
              <EstadoBadge completa={true} />
              <span className="opacity-75"> {completas}</span>
            </div>
          </div>

          <div className="row g-4">
            {tareas.map((tarea) => (
              <div
                key={tarea.id}
                className="col-12 col-sm-6 col-lg-4 col-xxl-3 d-flex"
              >
                <TareaItem tarea={tarea} />
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

export default Home;
