import { forwardRef } from 'react';
import { classNames } from '../../Scripts/utils/helpers.js';

/**
 * Átomo: Input
 */
const Input = forwardRef(function Input(
  { type = 'text', name, id, error, fullWidth = true, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      id={id || name}
      name={name}
      type={type}
      className={classNames(
        'input',
        fullWidth && 'w-full',
        !!error && 'input-error',
        className
      )}
      aria-invalid={!!error || undefined}
      aria-describedby={error ? `${id || name}-error` : undefined}
      {...rest}
    />
  );
});

export default Input;
