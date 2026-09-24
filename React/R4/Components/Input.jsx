// ============================================================
// Components/Input.jsx  (Átomo)
// Campo controlado: input o textarea con label, error inline
// y estilos para claro/oscuro.
// ============================================================
import { forwardRef } from 'react';

/**
 * @param {Object} props
 * @param {String} props.name
 * @param {String} props.label
 * @param {'text'|'email'|'textarea'} [props.type='text']
 * @param {String} [props.placeholder]
 * @param {String} [props.value]
 * @param {Function} [props.onChange]
 * @param {String} [props.errorMessage]
 * @param {Boolean} [props.disabled]
 * @param {Number} [props.rows=4]  (solo textarea)
 * @param {String} [props.className]
 */
export const Input = forwardRef(function Input(
  {
    name,
    label,
    type = 'text',
    placeholder,
    value = '',
    onChange,
    errorMessage,
    disabled = false,
    rows = 4,
    className = '',
    ...rest
  },
  ref
) {
  // Estilos base para claro/oscuro
  const baseField =
    'w-full rounded-lg border-2 bg-cream/60 dark:bg-deepBrown/60 ' +
    'px-4 py-2.5 text-softBrown dark:text-mutedBeige ' +
    'placeholder:text-softBrown/50 dark:placeholder:text-mutedBeige/50 ' +
    'transition-colors duration-300 focus:outline-none ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const normal =
    'border-softBrown/20 focus:border-terracotta dark:border-mutedBeige/30 dark:focus:border-burntOrange';

  const errored =
    'border-red-500/70 focus:border-red-600 dark:border-red-400/70';

  const Tag = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-softBrown dark:text-mustard"
      >
        {label}
      </label>
      <Tag
        ref={ref}
        id={name}
        name={name}
        type={type === 'textarea' ? undefined : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={type === 'textarea' ? rows : undefined}
        className={`${baseField} ${errorMessage ? errored : normal}`}
        {...rest}
      />
      {errorMessage && (
        <small
          role="alert"
          className="text-xs text-red-600 dark:text-red-400 font-medium"
        >
          {errorMessage}
        </small>
      )}
    </div>
  );
});

export default Input;
