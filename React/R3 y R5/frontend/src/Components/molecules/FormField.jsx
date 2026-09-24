import { classNames } from '../../Scripts/utils/helpers.js';
import Label from '../atoms/Label.jsx';
import Input from '../atoms/Input.jsx';

/**
 * Molécula: FormField — Campo label + input + helper/error.
 */
export default function FormField({
  id,
  name = id,
  label,
  type = 'text',
  required = false,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helper,
  autoComplete,
  autoFocus,
  inputClassName,
  className,
}) {
  return (
    <div className={classNames('mb-4', className)}>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        error={error}
        className={inputClassName}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[color:var(--accent-error)]">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="mt-1.5 text-xs text-[color:var(--text-muted)]">{helper}</p>
      )}
    </div>
  );
}
