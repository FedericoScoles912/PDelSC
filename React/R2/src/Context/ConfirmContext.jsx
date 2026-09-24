import { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from './ThemeContext.jsx';

const ConfirmContext = createContext(null);

/**
 * Provider que maneja el modal de confirmación (reemplaza window.confirm).
 * Expone `confirmar()` que devuelve una Promise<boolean>.
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ConfirmProvider({ children }) {
  const [modal, setModal] = useState(null);
  const { esOscuro } = useTheme();

  /**
   * Muestra el popup de confirmación y aguarda la decisión del usuario.
   * @param {Object} opciones
   * @param {string} opciones.titulo - Título del popup
   * @param {string} opciones.mensaje - Texto descriptivo
   * @param {string} [opciones.textoAceptar='Aceptar']
   * @param {string} [opciones.textoCancelar='Cancelar']
   * @param {'peligro'|'info'|'exito'} [opciones.variante='peligro']
   * @returns {Promise<boolean>} true si aceptó, false si canceló
   */
  const confirmar = useCallback(
    ({
      titulo = 'Confirmar acción',
      mensaje,
      textoAceptar = 'Aceptar',
      textoCancelar = 'Cancelar',
      variante = 'peligro'
    }) => {
      return new Promise((resolve) => {
        setModal({
          titulo,
          mensaje,
          textoAceptar,
          textoCancelar,
          variante,
          abierto: true,
          resolver: (valor) => {
            resolve(valor);
            setModal(null);
          }
        });
      });
    },
    []
  );

  const colorAceptarPorVariante = {
    peligro: esOscuro
      ? { backgroundColor: '#6B3A3E', color: '#FAF6EC', borderColor: '#6B3A3E' }
      : { backgroundColor: '#C97B5E', color: '#fff', borderColor: '#C97B5E' },
    info: esOscuro
      ? { backgroundColor: '#A8882B', color: '#3E2723', borderColor: '#A8882B' }
      : { backgroundColor: '#8A9A5B', color: '#fff', borderColor: '#8A9A5B' },
    exito: esOscuro
      ? { backgroundColor: '#B8860B', color: '#3E2723', borderColor: '#B8860B' }
      : { backgroundColor: '#8A9A5B', color: '#fff', borderColor: '#8A9A5B' }
  };

  const iconoPorVariante = {
    peligro: '⚠️',
    info: 'ℹ️',
    exito: '✅'
  };

  return (
    <ConfirmContext.Provider value={{ confirmar }}>
      {children}

      {modal && modal.abierto && (
        <div
          className="fixed inset-0 z-50 d-flex align-items-center justify-content-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div
            className="position-absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(3px)'
            }}
            onClick={() => modal.resolver(false)}
          />
          <div
            className={`relative rounded-2xl shadow-2xl p-5 m-3 w-100 max-w-md ${
              esOscuro ? 'bg-otoño-oscuro-chocolateSuave' : 'bg-white'
            }`}
            style={{
              animation: 'popIn 0.2s ease-out'
            }}
          >
            <style>{`
              @keyframes popIn {
                from { transform: scale(0.9); opacity: 0; }
                to   { transform: scale(1);   opacity: 1; }
              }
            `}</style>

            <header className="d-flex align-items-start gap-3 mb-4">
              <div
                className={`fs-3 d-inline-flex align-items-center justify-content-center rounded-circle ${
                  esOscuro ? 'bg-otoño-oscuro-grisCalido' : 'bg-otoño-claro-beige'
                }`}
                style={{ width: '52px', height: '52px' }}
                aria-hidden="true"
              >
                {iconoPorVariante[modal.variante] || '❓'}
              </div>
              <div className="flex-grow-1">
                <h3
                  id="confirm-modal-title"
                  className={`fs-4 fw-bold m-0 mb-2 ${
                    esOscuro ? 'text-otoño-claro-crema' : 'text-otoño-oscuro-chocolate'
                  }`}
                >
                  {modal.titulo}
                </h3>
                {modal.mensaje && (
                  <p
                    className={`m-0 fs-6 lh-lg opacity-90 whitespace-pre-line ${
                      esOscuro ? 'text-otoño-claro-crema' : 'text-otoño-oscuro-chocolate'
                    }`}
                  >
                    {modal.mensaje}
                  </p>
                )}
              </div>
            </header>

            <footer className="d-flex gap-3 justify-content-end mt-5 pt-3 border-top">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => modal.resolver(false)}
              >
                {modal.textoCancelar}
              </button>
              <button
                type="button"
                className="btn-primario fw-semibold"
                style={colorAceptarPorVariante[modal.variante]}
                onClick={() => modal.resolver(true)}
              >
                {modal.textoAceptar}
              </button>
            </footer>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * Hook para acceder al popup de confirmación.
 * @returns {{ confirmar: Function }}
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return ctx;
}

export default ConfirmContext;
