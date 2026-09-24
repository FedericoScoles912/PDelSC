import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/organisms/Navbar.jsx';
import Button from '../../Components/atoms/Button.jsx';
import Icon from '../../Components/atoms/Icon.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)]">
      <Navbar navigate={(p) => navigate(p)} current="/404" />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <p className="font-bold mb-2" style={{ fontSize: '6rem', lineHeight: 1, color: 'var(--accent-primary)' }}>404</p>
          <h1 className="text-3xl font-bold mb-2">Página no encontrada</h1>
          <p className="mb-6">La ruta que buscás no existe o fue movida.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/dashboard" className="no-underline">
              <Button><Icon name="chevronLeft" size={16} /> Volver al inicio</Button>
            </Link>
            <Button variant="secondary" onClick={() => navigate(-1)}>Atrás</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
