import { cn } from '../Scripts/utils/helpers.js';
import Spinner from './Spinner.jsx';

/**
 * Botón reutilizable con variantes de la paleta otoñal.
 *
 * - variant: primary (terracota) | accent (mostaza) | olive (verde) |
 *            outline | ghost | danger
 * - size: sm | md | lg
 * - loading: muestra un spinner y bloquea el click
 */
const VARIANTS = {
  primary:
    'bg-primary text-primary-on hover:bg-primary-hover border border-transparent shadow-sm',
  accent: 'bg-accent text-accent-on hover:brightness-95 border border-transparent shadow-sm',
  olive: 'bg-olive text-olive-on hover:bg-olive-hover border border-transparent shadow-sm',
  danger: 'bg-danger text-danger-on hover:bg-danger-hover border border-transparent shadow-sm',
  outline: 'bg-transparent text-ink border border-line hover:bg-surface-alt',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-surface-alt',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const SPINNER_SIZE = { sm: 'sm', md: 'sm', lg: 'md' };

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={SPINNER_SIZE[size] ?? 'sm'} />
      ) : (
        leftIcon && <span className="shrink-0 text-base" aria-hidden="true">{leftIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && rightIcon && (
        <span className="shrink-0 text-base" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}
