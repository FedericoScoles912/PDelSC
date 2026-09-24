import useTheme from '../../Scripts/hooks/useTheme.js';
import Button from './Button.jsx';

/**
 * Átomo: ToggleTheme — botón para cambiar entre claro/oscuro (usando íconos inline SVG, sin assets).
 */
export default function ToggleTheme({ size = 'md' }) {
  const { isDark, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      onClick={toggle}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </Button>
  );
}
