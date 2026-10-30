import { FiLoader } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

/**
 * Indicador de carga accesible. Se usa en botones, pantallas completas
 * y mientras se redirige/canjea el flujo OAuth.
 */
export default function Spinner({ size = 'md', className, label = 'Cargando…' }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
      <FiLoader className={cn('animate-spin text-current', SIZES[size] ?? SIZES.md)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
