import { useTheme } from '../Context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { isDark, toggleTema } = useTheme();

  return (
    <button
      onClick={toggleTema}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo oscuro activado' : 'Modo claro activado'}
      className={`d-inline-flex align-items-center justify-content-center
        width-11 height-11 rounded-full transition-all duration-300 border-0
        ${isDark
          ? 'bg-dark-gris hover:bg-dark-mostaza/30 text-dark-mostaza shadow-inner'
          : 'bg-light-crema hover:bg-light-marron/20 text-light-terracota shadow'
        }`}
      style={{ width: '44px', height: '44px' }}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}
