import { Link } from 'react-router-dom';
import { useTareas } from '../Context/TareasContext.jsx';
import TareaItem from '../Components/TareaItem.jsx';
import EstadoBadge from '../Components/EstadoBadge.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Página de inicio: lista todas las tareas en una grilla responsive.
 * Muestra estadísticas (totales / completas / pendientes) y enlace a crear.
 * @component
 */
function Home() {
  const { tareas } = useTareas();
  const { esOscuro } = useTheme();

  const totalTareas = tareas.length;
  const completas = tareas.filter((t) => t.completa).length;
  const pendientes = totalTareas - completas;

  return (
    <section className="d-flex flex-column gap-5">
      <header className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-4">
        <div>
          <h1 className="fs-1 fw-bold m-0 mb-2">Mis Tareas</h1>
          <p className="m-0 fs-5 opacity-85">
            Gestioná tus pendientes de manera simple y ordenada.
          </p>
        </div>
        <Link to="/crear" className="btn-primario text-decoration-none d-inline-flex align-items-center gap-2 fs-5">
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
            <p className="fs-6 opacity-90 m-0 mt-1">{totalTareas ? Math.round((completas / totalTareas) * 100) : 0}%</p>
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
            Creá tu primera tarea para empezar a organizarte.
          </p>
          <Link
            to="/crear"
            className="btn-primario text-decoration-none d-inline-flex align-items-center gap-2"
          >
            <span aria-hidden="true">+</span>
            Crear primera tarea
          </Link>
        </div>
      ) : (
        <section className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h2 className="fs-3 fw-bold m-0">Listado de tareas</h2>
            <div className="d-flex gap-2 flex-wrap">
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
