import { cn } from '../Scripts/utils/helpers.js';

/**
 * Separador con etiqueta centrada. Se usa entre el grupo de botones sociales
 * y el formulario tradicional (ej: "o continuá con email").
 */
export default function Divider({ label, className }) {
  if (!label) {
    return <hr className={cn('border-0 border-t border-line', className)} />;
  }

  return (
    <div className={cn('flex items-center gap-3', className)} role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" />
      <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
