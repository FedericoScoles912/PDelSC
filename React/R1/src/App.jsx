import { useState } from 'react';
import LayoutApp from './Layouts/LayoutApp.jsx';
import HolaMundo from './Components/HolaMundo.jsx';
import TarjetaPresentacion from './Components/TarjetaPresentacion.jsx';
import Contador from './Components/Contador.jsx';
import ListaTareas from './Components/ListaTareas.jsx';
import FormularioSimple from './Components/FormularioSimple.jsx';

const EJERCICIOS = [
  { id: 'hola-mundo', nombre: 'Hola Mundo', numero: 1, componente: HolaMundo },
  { id: 'tarjeta', nombre: 'Tarjeta', numero: 2, componente: TarjetaPresentacion },
  { id: 'contador', nombre: 'Contador', numero: 3, componente: Contador },
  { id: 'tareas', nombre: 'Tareas', numero: 4, componente: ListaTareas },
  { id: 'formulario', nombre: 'Formulario', numero: 5, componente: FormularioSimple }
];

/**
 * Componente raíz de la aplicación.
 * Gestiona mediante estado qué ejercicio se renderiza y provee
 * al LayoutApp la navegación común entre ejercicios.
 */
export default function App() {
  const [ejercicioActivo, setEjercicioActivo] = useState(EJERCICIOS[0].id);

  const EjercicioActual = EJERCICIOS.find((e) => e.id === ejercicioActivo)?.componente || HolaMundo;

  return (
    <LayoutApp
      ejercicioActivo={ejercicioActivo}
      onSeleccionarEjercicio={setEjercicioActivo}
      ejercicios={EJERCICIOS}
    >
      <EjercicioActual />
    </LayoutApp>
  );
}
