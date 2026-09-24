import { useNavigate } from 'react-router-dom';
import FormularioTarea from '../Components/FormularioTarea.jsx';
import BotonVolver from '../Components/BotonVolver.jsx';
import { useTareas } from '../Context/TareasContext.jsx';
import { useToast } from '../Context/ToastContext.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Página de creación de una tarea nueva.
 * Renderiza FormularioTarea y, al recibir el submit:
 *  - genera id único + fechaCreacion mediante TareasContext
 *  - muestra toast de confirmación
 *  - redirige al detalle de la tarea recién creada
 * @component
 */
function Crear() {
  const navigate = useNavigate();
  const { agregarTarea } = useTareas();
  const { mostrarToast } = useToast();
  const { esOscuro } = useTheme();

  /**
   * Maneja el submit exitoso del formulario.
   * @param {Object} datos - { titulo, descripcion, completa }
   */
  const handleCrear = (datos) => {
    const nuevaTarea = agregarTarea(datos);
    mostrarToast({
      mensaje: `Tarea "${nuevaTarea.titulo}" creada correctamente`,
      tipo: 'exito',
      duracion: 4000
    });
    navigate(`/tarea/${nuevaTarea.id}`);
  };

  return (
    <section className="d-flex flex-column gap-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <BotonVolver to="/" texto="Volver al inicio" />
      </div>

      <header className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-end gap-4">
        <div>
          <h1 className="fs-1 fw-bold m-0 mb-2">Crear nueva tarea</h1>
          <p className="m-0 fs-5 opacity-85">
            Completá el formulario para agregar una tarea a tu listado.
          </p>
        </div>
        <div
          className={`badge fs-6 px-4 py-2 ${
            esOscuro
              ? 'bg-otoño-oscuro-mostazaApagado text-otoño-claro-crema'
              : 'bg-otoño-claro-beige text-otoño-oscuro-chocolate'
          }`}
        >
          🔒 Los campos con <span className="text-danger">*</span> son obligatorios
        </div>
      </header>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8 col-xxl-7">
          <div
            className={`card-base ${
              esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white'
            }`}
          >
            <FormularioTarea onSubmit={handleCrear} />
          </div>

          <p className="text-center mt-4 opacity-75 fs-6">
            Al crear la tarea serás redirigido automáticamente a su detalle.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Crear;
