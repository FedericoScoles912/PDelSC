import { useEffect } from 'react';
import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Modal/Dialog reutilizable implementado sin alert/confirm del navegador.
 * Soporta: un botón (info/success/error/warning) o DOS botones (confirmación).
 * Cierre por botón, click en backdrop o tecla Escape.
 *
 * @param {Object} props
 * @param {boolean} props.visible
 * @param {string} [props.titulo]
 * @param {string|import('react').ReactNode} props.mensaje
 * @param {'success'|'info'|'warning'|'error'|'confirm'} [props.tipo='info']
 * @param {Function} props.onCerrar - () => void (botón primario si no hay onConfirmar;
 *   o bien botón cancelar / backdrop / escape cuando hay confirmación)
 * @param {string} [props.textoBoton='Aceptar']
 * @param {Function} [props.onConfirmar] - Si se provee, se renderiza un segundo botón
 *   de confirmación (acción peligrosa) y onCerrar pasa a ser el "Cancelar" / dismiss.
 * @param {string} [props.textoBotonConfirmar='Confirmar']
 */
export default function Modal({
  visible,
  titulo,
  mensaje,
  tipo = 'info',
  textoBoton = 'Aceptar',
  onCerrar,
  onConfirmar,
  textoBotonConfirmar = 'Confirmar'
}) {
  const { isDark } = useTheme();
  const esConfirmacion = Boolean(onConfirmar);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCerrar?.();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible, onCerrar]);

  if (!visible) return null;

  const esPeligro = tipo === 'error' || tipo === 'confirm';
  const colores = {
    success: {
      icono: '✅',
      barra: isDark ? 'bg-green-800/70' : 'bg-green-600',
      botonPrimario: isDark ? 'bg-green-800 hover:bg-green-700 text-dark-crema' : 'bg-green-600 hover:bg-green-700 text-white'
    },
    error: {
      icono: '❌',
      barra: isDark ? 'bg-dark-borgona' : 'bg-red-600',
      botonPrimario: isDark ? 'bg-dark-borgona hover:bg-opacity-90 text-dark-crema' : 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icono: '⚠️',
      barra: isDark ? 'bg-dark-mostaza' : 'bg-yellow-500',
      botonPrimario: isDark ? 'bg-dark-mostaza hover:bg-opacity-90 text-dark-chocolate' : 'bg-yellow-500 hover:bg-yellow-600 text-dark-chocolate'
    },
    confirm: {
      icono: '🗑️',
      barra: isDark ? 'bg-dark-borgona' : 'bg-red-600',
      botonPrimario: isDark ? 'bg-dark-borgona hover:bg-opacity-90 text-dark-crema' : 'bg-red-600 hover:bg-red-700 text-white'
    },
    info: {
      icono: 'ℹ️',
      barra: isDark ? 'bg-dark-mostaza/80' : 'bg-light-terracota',
      botonPrimario: isDark ? 'bg-dark-mostaza hover:bg-opacity-90 text-dark-chocolate' : 'bg-light-terracota hover:bg-opacity-90 text-light-crema'
    }
  };

  const est = colores[tipo] || colores.info;

  return (
    <div
      className="fixed inset-0 z-[100] d-flex align-items-center justify-content-center p-3 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titulo ? 'modal-title' : undefined}
    >
      <div
        className="card-base w-100 overflow-hidden animate-fade-in"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={est.barra} style={{ height: '5px' }} />

        <div className="p-4 p-md-5">
          <div className="d-flex align-items-start gap-3 mb-3">
            <span className="fs-3">{est.icono}</span>
            <div className="flex-grow-1">
              {titulo && (
                <h3
                  id="modal-title"
                  className={`m-0 fs-4 fw-bold ${isDark ? 'text-dark-mostaza' : 'text-light-terracota'}`}
                >
                  {titulo}
                </h3>
              )}
              <div className={`mt-2 texto-claro lh-base ${!titulo ? 'fs-5' : ''}`}>
                {mensaje}
              </div>
            </div>
          </div>

          <div className={`d-flex gap-3 mt-4 ${esConfirmacion ? 'justify-content-between flex-row-reverse' : 'justify-content-end'}`}>
            {esConfirmacion ? (
              <>
                <button
                  onClick={() => onConfirmar?.()}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 shadow-sm ${est.botonPrimario}`}
                  autoFocus
                >
                  {textoBotonConfirmar}
                </button>
                <button
                  onClick={() => onCerrar?.()}
                  className="btn-secundario px-4 py-2"
                >
                  {textoBoton}
                </button>
              </>
            ) : (
              <button
                onClick={() => onCerrar?.()}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 shadow-sm ${est.botonPrimario}`}
              >
                {textoBoton}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
