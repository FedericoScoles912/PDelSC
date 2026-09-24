import { forwardRef } from 'react';
import { classNames } from '../../Scripts/utils/helpers.js';

/**
 * Átomo: Button
 * variant: primary | secondary | ghost | danger
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    type = 'button',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    children,
    className,
    ...rest
  },
  ref
) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const cls = classNames(
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'secondary' && 'btn-secondary',
    variant === 'ghost' && 'btn-ghost',
    variant === 'danger' && 'btn-danger',
    sizes[size] || sizes.md,
    fullWidth && 'w-full',
    className
  );
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cls}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
        />
      )}
      {children}
    </button>
  );
});

export default Button;
