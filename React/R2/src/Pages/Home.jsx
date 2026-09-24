import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTareas } from '../Context/TareasContext.jsx';
import TareaItem from '../Components/TareaItem.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';
import { useToast } from '../Context/ToastContext.jsx';
import { useConfirm } from '../Context/ConfirmContext.jsx';

const FILTRO_TODAS = 'todas';
const FILTRO_PENDIENTES = 'pendientes';
const FILTRO_COMPLETAS = 'completas';

const ORDEN_FECHA_DESC = 'fecha_desc';
const ORDEN_FECHA_ASC = 'fecha_asc';
const ORDEN_TITULO_ASC = 'titulo_asc';
const ORDEN_ESTADO = 'estado';

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

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(FILTRO_TODAS);
  const [orden, setOrden] = useState(ORDEN_FECHA_DESC);

  const totalTareas = tareas.length;
  const completas = tareas.filter((t) => t.completa).length;
  const pendientes = totalTareas - completas;

  const tareasFiltradas = useMemo(() => {
    let resultado = [...tareas];

    const termino = busqueda.trim().toLowerCase();
    if (termino) {
      resultado = resultado.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termino) ||
          t.descripcion.toLowerCase().includes(termino)
      );
    }

    if (filtroEstado === FILTRO_PENDIENTES) {
      resultado = resultado.filter((t) => !t.completa);
    } else if (filtroEstado === FILTRO_COMPLETAS) {
      resultado = resultado.filter((t) => t.completa);
    }

    switch (orden) {
      case ORDEN_FECHA_ASC:
        resultado.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
        break;
      case ORDEN_TITULO_ASC:
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
        break;
      case ORDEN_ESTADO:
        resultado.sort((a, b) => Number(a.completa) - Number(b.completa));
        break;
      case ORDEN_FECHA_DESC:
      default:
        resultado.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    }

    return resultado;
  }, [tareas, busqueda, filtroEstado, orden]);

  const limpiarBusqueda = () => setBusqueda('');
  const hayFiltrosActivos = busqueda.trim() !== '' || filtroEstado !== FILTRO_TODAS;

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
          <div
            className={`card-base p-4 ${
              esOscuro
                ? 'bg-otoño-oscuro-grisCalido text-otoño-claro-crema'
                : 'bg-white'
            }`}
          >
            <div className="d-flex flex-column flex-xl-row gap-3 align-items-stretch align-items-xl-center">
              <div className="flex-grow-1 position-relative">
                <span
                  className="position-absolute top-50 translate-middle-y ms-3 opacity-60"
                  style={{ pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M12.5 12.5L16 16"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar tarea por título o descripción..."
                  className={`buscador-input w-full ps-5 pe-5 py-3 rounded-xl border-2 fs-6 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    esOscuro
                      ? 'bg-otoño-oscuro-chocolateSuave border-otoño-oscuro-mostazaApagado text-otoño-claro-crema placeholder-opacity-60 focus:ring-otoño-oscuro-mostaza focus:border-otoño-oscuro-mostaza'
                      : 'bg-otoño-claro-beige border-transparent text-otoño-oscuro-chocolate placeholder-opacity-50 focus:ring-otoño-claro-terracota focus:border-otoño-claro-terracota'
                  }`}
                  aria-label="Buscar tareas"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    className="position-absolute top-50 end-0 translate-middle-y me-3 border-0 bg-transparent opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Limpiar búsqueda"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 3L13 13M13 3L3 13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 align-items-stretch">
                <div
                  className={`filtro-group d-flex rounded-xl p-1 gap-1 ${
                    esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-otoño-claro-beige'
                  }`}
                  role="group"
                  aria-label="Filtrar por estado"
                >
                  {[
                    { valor: FILTRO_TODAS, etiqueta: 'Todas', contador: totalTareas },
                    { valor: FILTRO_PENDIENTES, etiqueta: 'Pendientes', contador: pendientes },
                    { valor: FILTRO_COMPLETAS, etiqueta: 'Completadas', contador: completas }
                  ].map((f) => (
                    <button
                      key={f.valor}
                      type="button"
                      onClick={() => setFiltroEstado(f.valor)}
                      className={`filtro-chip px-3 py-2 rounded-lg fs-6 fw-medium border-0 transition-all duration-200 d-inline-flex align-items-center gap-2 ${
                        filtroEstado === f.valor
                          ? esOscuro
                            ? 'bg-otoño-oscuro-mostaza text-otoño-oscuro-chocolate shadow-sm'
                            : 'bg-otoño-claro-terracota text-white shadow-sm'
                          : esOscuro
                          ? 'bg-transparent text-otoño-claro-crema opacity-80 hover:opacity-100 hover:bg-otoño-oscuro-grisCalido'
                          : 'bg-transparent text-otoño-oscuro-chocolate opacity-80 hover:opacity-100 hover:bg-white'
                      }`}
                    >
                      <span>{f.etiqueta}</span>
                      <span
                        className={`filtro-contador px-2 py-0.5 rounded-pill fs-6 ${
                          filtroEstado === f.valor
                            ? esOscuro
                              ? 'bg-otoño-oscuro-chocolate bg-opacity-20 text-otoño-oscuro-chocolate'
                              : 'bg-white bg-opacity-25 text-white'
                            : esOscuro
                            ? 'bg-otoño-oscuro-grisCalido text-otoño-claro-crema'
                            : 'bg-white text-otoño-oscuro-chocolate'
                        }`}
                      >
                        {f.contador}
                      </span>
                    </button>
                  ))}
                </div>

                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className={`orden-select px-3 py-2 rounded-xl fs-6 border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 ${
                    esOscuro
                      ? 'bg-otoño-oscuro-chocolateSuave border-otoño-oscuro-mostazaApagado text-otoño-claro-crema focus:ring-otoño-oscuro-mostaza focus:border-otoño-oscuro-mostaza'
                      : 'bg-otoño-claro-beige border-transparent text-otoño-oscuro-chocolate focus:ring-otoño-claro-terracota focus:border-otoño-claro-terracota'
                  }`}
                  aria-label="Ordenar tareas"
                >
                  <option value={ORDEN_FECHA_DESC}>Más recientes</option>
                  <option value={ORDEN_FECHA_ASC}>Más antiguas</option>
                  <option value={ORDEN_TITULO_ASC}>Título (A-Z)</option>
                  <option value={ORDEN_ESTADO}>Estado (Pte. primero)</option>
                </select>
              </div>
            </div>

            {(hayFiltrosActivos || orden !== ORDEN_FECHA_DESC) && (
              <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="fs-6 opacity-75 d-flex align-items-center gap-2 flex-wrap">
                  <span>
                    Mostrando <strong>{tareasFiltradas.length}</strong> de{' '}
                    <strong>{totalTareas}</strong> tarea(s)
                  </span>
                  {busqueda && (
                    <span className="badge bg-secondary">
                      Búsqueda: "{busqueda}"
                    </span>
                  )}
                </div>
                {hayFiltrosActivos && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda('');
                      setFiltroEstado(FILTRO_TODAS);
                    }}
                    className="btn btn-link fs-6 text-decoration-underline p-0 opacity-80 hover:opacity-100"
                    style={{ color: 'inherit' }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {tareasFiltradas.length === 0 ? (
            <div
              className={`card-base text-center py-5 ${
                esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white'
              }`}
            >
              <div className="fs-1 mb-3" aria-hidden="true">🔍</div>
              <h2 className="fs-4 fw-bold mb-2">No se encontraron tareas</h2>
              <p className="fs-6 opacity-85 mb-4">
                Probá con otro término de búsqueda o modificá los filtros activos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setFiltroEstado(FILTRO_TODAS);
                }}
                className="btn-primario d-inline-flex align-items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 3H5M13 3V11M13 3L5 11"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {tareasFiltradas.map((tarea) => (
                <div
                  key={tarea.id}
                  className="col-12 col-sm-6 col-xl-4 d-flex"
                >
                  <TareaItem tarea={tarea} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default Home;
