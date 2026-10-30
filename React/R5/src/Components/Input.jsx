import { forwardRef, useId, useState } from 'react';
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';

/**
 * Campo de texto reutilizable, compatible con React Hook Form:
 *
 *   <Input label="Email" error={errors.email?.message} {...register('email', emailField)} />
 *
 * `forwardRef` es necesario para que RHF reciba la referencia del input real.
 * Si `type="password"`, se agrega el toggle de visibilidad.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    id,
    type = 'text',
    leadingIcon = null,
    trailing = null,
    className,
    containerClassName,
    required = false,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `field-${autoId}`;
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);

  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  const resolvedType = isPassword && revealed ? 'text' : type;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        {leadingIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}

        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface text-ink placeholder:text-muted/70',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-canvas',
            leadingIcon ? 'pl-10' : 'pl-3.5',
            isPassword || trailing ? 'pr-11' : 'pr-3.5',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/40'
              : 'border-line focus:border-primary focus:ring-primary/40',
            className
          )}
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className={cn(
              'absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted',
              'hover:bg-surface-alt hover:text-ink transition-colors'
            )}
          >
            {revealed ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
          </button>
        ) : (
          trailing && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{trailing}</span>
          )
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <FiAlertCircle aria-hidden="true" className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
});

export default Input;
