import { Link } from 'react-router-dom';

import Button from '../../Components/Button.jsx';
import Card from '../../Components/Card.jsx';

/** 404 del Sistema A: cualquier ruta desconocida vuelve al panel. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Esta página no existe</h1>
        <p className="mt-2 text-sm text-muted">
          La dirección que abriste no corresponde a ninguna vista del sistema.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/dashboard">
            <Button>Volver al panel</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
