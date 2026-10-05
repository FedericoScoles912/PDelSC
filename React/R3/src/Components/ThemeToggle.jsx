import React from 'react';
import { useTheme } from '../Scripts/hooks/useTheme.js';

/**
 * Interruptor de tema claro/oscuro con paleta otoñal persistente
 */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro otoñal' : 'Cambiar a modo oscuro otoñal'}
      aria-label="Alternar tema visual"
      className={`p-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-autumn-terracotta/40 
        ${
          isDark
            ? 'bg-autumn-darkbg-card border-autumn-darkbg-border text-autumn-mustard-light hover:bg-autumn-darkbg-hover'
            : 'bg-white border-autumn-beige-300 text-autumn-terracotta hover:bg-autumn-beige-100'
        } ${className}`}
    >
      {isDark ? (
        // Icono Sol
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Icono Luna
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
