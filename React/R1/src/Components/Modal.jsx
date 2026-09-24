import { useEffect } from 'react';
import { useTheme } from '../Context/ThemeContext.jsx';

/**
 * Modal/Toast reutilizable implementado sin bibliotecas externas (sin alert()).
 * Se muestra u oculta mediante una prop booleana. Soporta título, mensaje, tipo
 * y un callback al cerrar. Incluye cierre con botón, click en backdrop y tecla Escape.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla si el modal se muestra
 * @param {string} [props.titulo] - Título opcional del modal
 * @param {string|import('react').ReactNode} props.mensaje - Contenido principal
 * @param {'success'|'info'|'warning'|'error'} [props.tipo='info'] - Variante de color
 * @param {Function} props.onCerrar - Callback al cerrar () => void
 * @param {string} [props.textoBoton='Aceptar'] - Texto del botón de confirmación
 */
export default function Modal({ visible, titulo, mensaje, tipo = 'info', onCerrar, textoBoton = 'Aceptar' }) {
  const { isDark } = useTheme();

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

  const colores = {
    success: {
      icono: '✅',
      barra: isDark ? 'bg-green-800/70' : 'bg-green-600',
      boton: isDark ? 'bg-green-800 hover:bg-green-700 text-dark-crema' : 'bg-green-600 hover:bg-green-700 text-white'
    },
    error: {
      icono: '❌',
      barra: isDark ? 'bg-dark-borgona' : 'bg-red-600',
      boton: isDark ? 'bg-dark-borgona hover:bg-opacity-90 text-dark-crema' : 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icono: '⚠️',
      barra: isDark ? 'bg-dark-mostaza' : 'bg-yellow-500',
      boton: isDark ? 'bg-dark-mostaza hover:bg-opacity-90 text-dark-chocolate' : 'bg-yellow-500 hover:bg-yellow-600 text-dark-chocolate'
    },
    info: {
      icono: 'ℹ️',
      barra: isDark ? 'bg-dark-mostaza/80' : 'bg-light-terracota',
      boton: isDark ? 'bg-dark-mostaza hover:bg-opacity-90 text-dark-chocolate' : 'bg-light-terracota hover:bg-opacity-90 text-light-crema'
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
    >
      <div
        className={`card-base w-100 overflow-hidden animate-fade-in`}
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${est.barra} height-1`} style={{ height: '5px' }} />

        <div className="p-4 p-md-5">
          <div className="d-flex align-items-start gap-3 mb-3">
            <span className="fs-3">{est.icono}</span>
            <div className="flex-grow-1">
              {titulo && (
                <h3 className={`m-0 fs-4 fw-bold ${isDark ? 'text-dark-mostaza' : 'text-light-terracota'}`}>
                  {titulo}
                </h3>
              )}
              <div className={`mt-2 texto-claro lh-base ${!titulo ? 'fs-5' : ''}`}>
                {mensaje}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              onClick={() => onCerrar?.()}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-0 shadow-sm ${est.boton}`}
            >
              {textoBoton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
