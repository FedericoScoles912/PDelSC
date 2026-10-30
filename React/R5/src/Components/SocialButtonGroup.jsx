import { cn } from '../Scripts/utils/helpers.js';
import { OAUTH_PROVIDERS, getProvider } from '../Scripts/config/oauthProviders.js';
import SocialButton from './SocialButton.jsx';

/**
 * Grilla responsive de SocialButton.
 *
 * Usa el sistema de grid de Bootstrap (row / col / breakpoints) combinado con
 * Tailwind: 4 columnas en desktop, 2 en tablet y 1 en mobile por defecto.
 * Se reutiliza tal cual en el Sistema A y en el Sistema B.
 */
const COLUMN_CLASSES = {
  2: 'row-cols-1 row-cols-sm-2',
  3: 'row-cols-1 row-cols-sm-2 row-cols-lg-3',
  4: 'row-cols-1 row-cols-sm-2 row-cols-xl-4',
};

export default function SocialButtonGroup({
  providers,
  onSelect,
  disabled = false,
  busyProvider = null,
  columns = 4,
  size = 'md',
  className,
}) {
  const ids = providers ?? OAUTH_PROVIDERS.map((provider) => provider.id);
  const available = ids.filter((id) => getProvider(id));

  if (available.length === 0) return null;

  return (
    <div
      className={cn('row g-3', COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[4], className)}
      role="group"
      aria-label="Proveedores de inicio de sesión social"
    >
      {available.map((provider) => (
        <div className="col" key={provider}>
          <SocialButton
            provider={provider}
            size={size}
            onClick={onSelect}
            disabled={disabled}
            loading={busyProvider === provider}
          />
        </div>
      ))}
    </div>
  );
}
