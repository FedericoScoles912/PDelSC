import { useToast } from '../Context/ToastContext.jsx';

/**
 * Componente Toast global para notificaciones (éxito / error / info).
 * Se muestra/oculta según el estado de ToastContext.
 * Nunca usa alert().
 * @component
 */
function Toast() {
  const { toast, ocultarToast } = useToast();

  if (!toast) return null;

  const coloresPorTipo = {
    exito: {
      fondo: 'bg-otoño-claro-oliva dark:bg-otoño-oscuro-mostaza',
      texto: 'text-white dark:text-otoño-oscuro-chocolate',
      icono: '✓'
    },
    error: {
      fondo: 'bg-otoño-claro-terracota dark:bg-otoño-oscuro-borgoña',
      texto: 'text-white dark:text-otoño-claro-crema',
      icono: '✕'
    },
    info: {
      fondo: 'bg-otoño-claro-marron dark:bg-otoño-oscuro-grisCalido',
      texto: 'text-white dark:text-otoño-claro-crema',
      icono: 'ℹ'
    }
  };

  const estilos = coloresPorTipo[toast.tipo] || coloresPorTipo.info;

  return (
    <div
      className="fixed top-4 end-4 z-50 w-auto max-w-sm"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`${estilos.fondo} ${estilos.texto} rounded-xl shadow-lg p-4 d-flex align-items-center gap-3 animate__fadeIn`}
        style={{
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <span
          className="fs-5 fw-bold d-inline-flex align-items-center justify-content-center"
          style={{ width: '28px', height: '28px' }}
          aria-hidden="true"
        >
          {estilos.icono}
        </span>
        <p className="m-0 fs-6 flex-grow-1 fw-medium">{toast.mensaje}</p>
        <button
          type="button"
          onClick={ocultarToast}
          className="btn-close btn-close-white opacity-75 hover:opacity-100"
          aria-label="Cerrar notificación"
          style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Toast;
