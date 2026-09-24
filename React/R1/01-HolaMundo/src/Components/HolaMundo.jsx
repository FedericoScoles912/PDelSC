import EjercicioWrapper from './EjercicioWrapper.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';

export default function HolaMundo() {
  const { isDark } = useTheme();

  return (
    <EjercicioWrapper
      numero={1}
      titulo="Hola Mundo"
      descripcion="Mi primer componente React. Tres variantes de estilos con TailwindCSS."
    >
      <div className="container p-0">
        <div className="row g-4">

          <div className="col-12 col-md-4">
            <div
              className={`rounded-xl p-5 text-center shadow-sm border transition-all duration-300
                ${isDark
                  ? 'bg-dark-gris border-dark-mostaza/40'
                  : 'bg-light-beige border-light-marron/40'}`}
            >
              <p
                className={`m-0 fs-1 fw-bold ${isDark ? 'text-dark-mostaza' : 'text-light-terracota'}`}
              >
                ¡Hola, mundo!
              </p>
              <p className="m-0 mt-2 text-sm texto-claro">
                Variante 1 · Tipografía grande y color sólido
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div
              className={`rounded-xl p-5 text-center shadow-sm border transition-all duration-300
                ${isDark
                  ? 'bg-dark-chocolate border-dark-borgona/50'
                  : 'bg-light-crema border-light-terracota/50'}`}
            >
              <p
                className={`m-0 fs-2 fw-semibold fst-italic animate-pulse-slow
                  ${isDark ? 'text-dark-crema' : 'text-light-oliva'}`}
              >
                ¡Hola, mundo!
              </p>
              <p className="m-0 mt-2 text-sm texto-claro">
                Variante 2 · Cursiva + animación pulse lenta
              </p>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div
              className={`rounded-xl p-5 text-center shadow-sm border transition-all duration-300
                ${isDark
                  ? 'bg-dark-mostaza/20 border-dark-mostaza/60'
                  : 'bg-light-terracota/10 border-light-terracota/60'}`}
            >
              <p
                className={`m-0 fs-3 fw-bold tracking-widest animate-bounce-slow
                  bg-gradient-to-r ${isDark ? 'from-dark-mostaza via-dark-crema to-dark-borgona' : 'from-light-terracota via-light-marron to-light-oliva'
                  } bg-clip-text text-transparent`}
                style={{ WebkitBackgroundClip: 'text' }}
              >
                ¡Hola, mundo!
              </p>
              <p className="m-0 mt-2 text-sm texto-claro">
                Variante 3 · Gradiente + bounce lento
              </p>
            </div>
          </div>

        </div>
      </div>
    </EjercicioWrapper>
  );
}
