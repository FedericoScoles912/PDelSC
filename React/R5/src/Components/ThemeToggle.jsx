import { FiMoon, FiSun } from 'react-icons/fi';

import { cn } from '../Scripts/utils/helpers.js';
import { useTheme } from '../Scripts/hooks/useTheme.js';

/**
 * Toggle de tema claro/oscuro. Persiste la preferencia en localStorage
 * (gestionado por ThemeContext). Se usa en el header de ambos sistemas.
 */
export default function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line',
        'bg-surface text-ink transition-colors hover:bg-surface-alt',
        className
      )}
    >
      {isDark ? (
        <FiSun aria-hidden="true" className="text-lg text-accent" />
      ) : (
        <FiMoon aria-hidden="true" className="text-lg text-primary" />
      )}
    </button>
  );
}
