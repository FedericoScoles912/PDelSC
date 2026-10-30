import { FiAlertCircle } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';

/**
 * Envoltorio de formulario: encabezado (título/subtítulo), mensaje de error
 * general devuelto por la API y el <form> en sí.
 *
 * No maneja estado: la lógica de envío/validación la aporta React Hook Form
 * desde la vista (handleSubmit). Así el componente queda puramente presentacional.
 */
export default function FormWrapper({
  title,
  subtitle,
  error,
  onSubmit,
  children,
  footer,
  className,
  ...rest
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('flex flex-col gap-5', className)}
      {...rest}
    >
      {(title || subtitle) && (
        <header className="flex flex-col gap-1">
          {title && <h1 className="text-2xl font-semibold text-ink text-balance">{title}</h1>}
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </header>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {children}

      {footer && <div className="pt-1">{footer}</div>}
    </form>
  );
}
