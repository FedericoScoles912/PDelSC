import { ThemeProvider } from './Scripts/context/ThemeContext.jsx';
import { NoticeProvider } from './Scripts/context/NoticeContext.jsx';
import { AuthProvider } from './Scripts/context/AuthContext.jsx';
import RouterSystem from './RouterSystem/RouterSystem.jsx';

/**
 * Composición de proveedores globales, compartida por ambos sistemas:
 *
 *   ThemeProvider  -> modo claro/oscuro
 *   NoticeProvider -> avisos y confirmaciones propias (sin alert/confirm)
 *   AuthProvider   -> sesión, perfil y cuentas vinculadas
 *
 * Por ahora se monta el Sistema A (React Router). En la Etapa 5 este punto
 * pasa a decidir entre RouterSystem (A) y StateSystem (B) según el parámetro
 * `system` de la URL.
 */
export default function App() {
  return (
    <ThemeProvider>
      <NoticeProvider>
        <AuthProvider>
          <RouterSystem />
        </AuthProvider>
      </NoticeProvider>
    </ThemeProvider>
  );
}
