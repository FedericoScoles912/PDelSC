import { useState } from 'react';
import EjercicioWrapper from './EjercicioWrapper.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';
import { clamp } from '../Scripts/helpers.js';

const MIN_VALOR = 0;
const MAX_VALOR = 999;

/**
 * Ejercicio 3: Contador interactivo.
 * Usa useState para gestionar el valor numérico.
 * Incluye botones de incrementar, decrementar y reset.
 * No permite bajar de MIN_VALOR ni superar MAX_VALOR.
 * Sin props externas.
 *
 * @returns {JSX.Element}
 */
export default function Contador() {
  const [valor, setValor] = useState(0);
  const { isDark } = useTheme();

  const incrementar = () => setValor((v) => clamp(v + 1, MIN_VALOR, MAX_VALOR));
  const decrementar = () => setValor((v) => clamp(v - 1, MIN_VALOR, MAX_VALOR));
  const resetear = () => setValor(0);

  const enMinimo = valor <= MIN_VALOR;
  const enMaximo = valor >= MAX_VALOR;

  return (
    <EjercicioWrapper
      numero={3}
      titulo="Contador"
      descripcion="Estado local con useState. Incrementar, decrementar y resetear (mínimo 0, máximo 999)."
    >
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div
            className={`rounded-xl p-5 text-center shadow-sm border
              ${isDark
                ? 'bg-dark-gris/40 border-dark-mostaza/40'
                : 'bg-light-beige border-light-marron/30'}`}
          >
            <p className="m-0 mb-2 text-sm texto-claro text-uppercase tracking-widest">
              Valor actual
            </p>
            <p
              className="m-0 mb-4 fw-black animate-fade-in"
              key={valor}
              style={{ fontSize: 'clamp(3.5rem, 10vw, 6rem)', lineHeight: 1 }}
            >
              <span className={isDark ? 'text-dark-mostaza' : 'text-light-terracota'}>
                {valor}
              </span>
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3">
              <button
                onClick={decrementar}
                disabled={enMinimo}
                className={`px-4 py-3 rounded-lg fw-bold fs-5 transition-all duration-200 border-0 shadow-sm
                  ${enMinimo
                    ? 'opacity-50 cursor-not-allowed bg-gray-400'
                    : isDark
                      ? 'bg-dark-borgona text-dark-crema hover:bg-opacity-90 hover:shadow-md'
                      : 'bg-light-marron text-light-crema hover:bg-opacity-90 hover:shadow-md'
                  }`}
                aria-label="Decrementar"
              >
                −
              </button>

              <button
                onClick={resetear}
                className="btn-secundario px-4 py-3 fs-6"
                aria-label="Resetear"
              >
                ↺ Reset
              </button>

              <button
                onClick={incrementar}
                disabled={enMaximo}
                className={`px-4 py-3 rounded-lg fw-bold fs-5 transition-all duration-200 border-0 shadow-sm
                  ${enMaximo
                    ? 'opacity-50 cursor-not-allowed bg-gray-400'
                    : isDark
                      ? 'bg-dark-mostaza text-dark-chocolate hover:bg-opacity-90 hover:shadow-md'
                      : 'bg-light-terracota text-light-crema hover:bg-opacity-90 hover:shadow-md'
                  }`}
                aria-label="Incrementar"
              >
                +
              </button>
            </div>

            <div className="mt-4 d-flex justify-content-between text-xs texto-claro">
              <span>Mín: {MIN_VALOR}</span>
              <span>Máx: {MAX_VALOR}</span>
            </div>
          </div>
        </div>
      </div>
    </EjercicioWrapper>
  );
}
