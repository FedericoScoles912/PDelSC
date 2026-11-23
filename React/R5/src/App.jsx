import { ThemeProvider } from './Scripts/context/ThemeContext.jsx';
import { NoticeProvider } from './Scripts/context/NoticeContext.jsx';
import { AuthProvider } from './Scripts/context/AuthContext.jsx';
import { SYSTEMS, normalizeSystem } from './Scripts/utils/constants.js';
import RouterSystem from './RouterSystem/RouterSystem.jsx';
import StateSystem from './StateSystem/StateSystem.jsx';

/**
 * Resuelve qué sistema de frontend montar según el parámetro `?system=` de la URL.
 * Por defecto monta el Sistema A (React Router); con `?system=state` monta el Sistema B (useState).
 */
function resolveActiveSystem() {
  const params = new URLSearchParams(window.location.search);
  return normalizeSystem(params.get('system'));
}

export default function App() {
  const activeSystem = resolveActiveSystem();

  return (
    <ThemeProvider>
      <NoticeProvider>
        <AuthProvider>
          {activeSystem === SYSTEMS.STATE ? <StateSystem /> : <RouterSystem />}
        </AuthProvider>
      </NoticeProvider>
    </ThemeProvider>
  );
}
