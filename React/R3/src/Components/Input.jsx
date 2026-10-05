import React, { forwardRef } from 'react';

/**
 * Componente atómico Input con soporte completo para react-hook-form
 */
const Input = forwardRef(function Input(
  {
    label,
    name,
    type = 'text',
    error,
    placeholder,
    className = '',
    helperText,
    disabled = false,
    ...rest
  },
  ref
) {
  const hasError = Boolean(error);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left mb-4">
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-wider text-autumn-warmbrown-light dark:text-autumn-darktext-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={hasError ? 'true' : 'false'}
          className={`w-full px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-autumn-darkbg-card border transition-all duration-200 focus:outline-none focus:ring-2 
            ${
              hasError
                ? 'border-red-500 text-red-900 dark:text-red-200 focus:ring-red-400 focus:border-red-500'
                : 'border-autumn-beige-300 dark:border-autumn-darkbg-border text-autumn-warmbrown dark:text-autumn-darktext-primary focus:border-autumn-terracotta focus:ring-autumn-terracotta/20 dark:focus:border-autumn-terracotta-light dark:focus:ring-autumn-terracotta-light/20'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed bg-autumn-beige-100 dark:bg-autumn-darkbg' : ''}
            ${className}`}
          {...rest}
        />
      </div>

      {hasError && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {typeof error === 'string' ? error : error?.message}
        </p>
      )}

      {helperText && !hasError && (
        <p className="text-xs text-autumn-warmbrown-light dark:text-autumn-darktext-muted mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
