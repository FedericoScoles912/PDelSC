import LayoutApp from './Layouts/LayoutApp.jsx';
import FormularioSimple from './Components/FormularioSimple.jsx';

/**
 * Componente raíz del ejercicio 5.
 * Renderiza el Layout principal con el FormularioSimple.
 * Sin navegación entre ejercicios (proyecto standalone).
 */
export default function App() {
  return (
    <LayoutApp>
      <FormularioSimple />
    </LayoutApp>
  );
}
