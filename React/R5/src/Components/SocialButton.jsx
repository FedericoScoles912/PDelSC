import { cn } from '../Scripts/utils/helpers.js';
import { getProvider, getProviderName, getProviderTone } from '../Scripts/config/oauthProviders.js';
import Spinner from './Spinner.jsx';

const SIZES = {
  md: 'h-11 text-sm',
  lg: 'h-12 text-base',
};

/**
 * Botón de un proveedor social.
 *
 * Conserva el ícono reconocible de la marca pero adapta fondo y borde a la
 * paleta otoñal (contraste AA). Toda la información del proveedor sale de
 * /Scripts/config/oauthProviders.js: agregar un proveedor no toca este archivo.
 */
export default function SocialButton({
  provider,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = true,
  size = 'md',
  className,
}) {
  const meta = getProvider(provider);
  const name = getProviderName(provider);
  const tone = getProviderTone(provider);

  const Icon = meta?.Icon;

  return (
    <button
      type="button"
      onClick={() => onClick?.(provider)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={`Continuar con ${name}`}
      className={cn(
        'group inline-flex items-center justify-center gap-2.5 rounded-xl border',
        'border-line bg-surface px-4 font-medium text-ink',
        'transition-all duration-150 hover:bg-surface-alt',
        'disabled:cursor-not-allowed disabled:opacity-60',
        tone.ring,
        fullWidth && 'w-full',
        SIZES[size] ?? SIZES.md,
        className
      )}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        Icon && <Icon aria-hidden="true" className={cn('shrink-0 text-lg', tone.icon)} />
      )}
      <span className="truncate">{loading ? 'Redirigiendo…' : `Continuar con ${name}`}</span>
    </button>
  );
}
