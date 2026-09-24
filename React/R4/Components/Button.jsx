// ============================================================
// Components/Button.jsx  (Átomo)
// Botón con variantes (primary / secondary / ghost) y tamaños
// Integración con paleta otoñal y modo claro/oscuro
// ============================================================
import { forwardRef } from 'react';

/**
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {String} [props.className]
 * @param {Boolean} [props.disabled]
 * @param {Function} [props.onClick]
 * @param {React.ReactNode} props.children
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    children,
    ...rest
  },
  ref
) {
  // Variantes de colores según paleta otoñal
  const variants = {
    primary:
      'btn-primary',
    secondary:
      'btn-secondary',
    ghost:
      'btn-ghost',
  };

  // Tamaños (padding y fuente)
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold ' +
    'focus:outline-none focus:ring-2 focus:ring-terracotta/60 dark:focus:ring-burntOrange/60 ' +
    'transition-all duration-300 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none';

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
