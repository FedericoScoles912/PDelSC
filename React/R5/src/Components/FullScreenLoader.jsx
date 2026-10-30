import Spinner from './Spinner.jsx';

/**
 * Pantalla completa de espera, compartida por ambos sistemas.
 *
 * Se usa mientras se restaura la sesión y en el retorno de OAuth: el usuario
 * "no suelta la página" hasta que la sesión está resuelta.
 */
export default function FullScreenLoader({ label = 'Cargando…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-muted">
      <Spinner size="lg" label={label} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
