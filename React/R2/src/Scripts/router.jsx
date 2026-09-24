import { Routes, Route } from 'react-router-dom';
import Layout from '../Layouts/Layout.jsx';
import Home from '../Pages/Home.jsx';
import Detalle from '../Pages/Detalle.jsx';
import Crear from '../Pages/Crear.jsx';
import Toast from '../Components/Toast.jsx';

/**
 * Configuración centralizada de rutas de la SPA.
 * Wrapea todas las páginas en el Layout común (Navbar + Toast).
 * Rutas:
 *  - /           → Home (lista de tareas)
 *  - /tarea/:id  → Detalle de una tarea específica
 *  - /crear      → Formulario de creación
 * @component
 */
function AppRouter() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tarea/:id" element={<Detalle />} />
        <Route path="/crear" element={<Crear />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toast />
    </Layout>
  );
}

export default AppRouter;
