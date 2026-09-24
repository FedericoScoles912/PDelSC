import { ThemeProvider } from './Scripts/context/ThemeContext.jsx';
import { NotificationProvider } from './Scripts/context/NotificationContext.jsx';
import { AuthProvider } from './Scripts/context/AuthContext.jsx';
import NotificationContainer from './Components/organisms/NotificationContainer.jsx';
import RouterSystem from './router-system/index.jsx';
import StateSystem from './state-system/index.jsx';

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
