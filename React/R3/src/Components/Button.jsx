import React from 'react';

/**
 * Componente atómico Button con paleta otoñal
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...rest
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]';

  const variants = {
    primary:
      'bg-autumn-terracotta hover:bg-autumn-terracotta-hover text-white focus:ring-autumn-terracotta dark:bg-autumn-terracotta-light dark:hover:bg-autumn-terracotta dark:text-autumn-darkbg',
    secondary:
      'bg-autumn-mustard hover:bg-autumn-mustard-dark text-autumn-warmbrown-dark focus:ring-autumn-mustard dark:bg-autumn-mustard-light dark:text-autumn-darkbg',
    olive:
      'bg-autumn-olive hover:bg-autumn-olive-dark text-white focus:ring-autumn-olive dark:bg-autumn-olive-light dark:text-autumn-darkbg',
    outline:
      'border-2 border-autumn-terracotta text-autumn-terracotta hover:bg-autumn-terracotta hover:text-white dark:border-autumn-terracotta-light dark:text-autumn-terracotta-light dark:hover:bg-autumn-terracotta-light dark:hover:text-autumn-darkbg',
    ghost:
      'bg-transparent hover:bg-autumn-beige-200 text-autumn-warmbrown dark:hover:bg-autumn-darkbg-hover dark:text-autumn-darktext-primary',
    danger:
      'bg-red-700 hover:bg-red-800 text-white focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
