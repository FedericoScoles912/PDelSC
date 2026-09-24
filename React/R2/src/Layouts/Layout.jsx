import Navbar from './Navbar.jsx';

/**
 * Layout general de la aplicación.
 * Envuelve todas las páginas con Navbar + contenedor principal responsive.
 * @component
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Contenido de la página actual
 */
function Layout({ children }) {
  return (
    <div className="bg-layout min-vh-100 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1 container py-5 px-3 px-md-4">
        {children}
      </main>
      <footer className="py-4 text-center border-top fs-6 opacity-80">
        <div className="container">
          <p className="m-0">
            🍂 Gestor de Tareas SPA · React + React Router + Tailwind · Práctica R2
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
