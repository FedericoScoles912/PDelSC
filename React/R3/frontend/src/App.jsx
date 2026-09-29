import { ThemeProvider } from './Contexts/ThemeContext.jsx';
import { NotificationProvider } from './Contexts/NotificationContext.jsx';
import { AuthProvider } from './Contexts/AuthContext.jsx';
import NotificationContainer from './Components/Organisms/NotificationContainer.jsx';
import RouterSystem from './RouterSystem/index.jsx';
import StateSystem from './StateSystem/index.jsx';

const SYSTEM = (import.meta.env.VITE_SYSTEM || 'router').toLowerCase();

/**
 * App — Wrapper de Contexts globales + elección del sistema de navegación.
 *
 * VITE_SYSTEM === 'router'  -> Sistema A (React Router, por defecto).
 * VITE_SYSTEM === 'state'   -> Sistema B (useState puro).
 */
export default function App() {
  const useStateSystem = SYSTEM === 'state';

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          {useStateSystem ? <StateSystem /> : <RouterSystem />}
          <NotificationContainer />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
