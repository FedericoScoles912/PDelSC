// ============================================================
// tailwind.config.js
// Paleta otoñal personalizada + dark mode por clase
// ============================================================
/** @type {import('tailwindcss').Config} */
export default {
  // Activamos dark mode añadiendo/quitando la clase "dark" en <html>
  darkMode: 'class',
  content: [
    './index.html',
    './Components/**/*.{js,jsx}',
    './Scripts/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // Paleta de colores relajada y cálida (no blanco/negro puros)
      colors: {
        // Modo claro
        cream: '#F5EFE6',       // fondo principal claro
        terracotta: '#C97B4C',  // acento cálido principal
        olive: '#7C8B6C',       // acento secundario verde
        softBrown: '#6B4F3B',   // texto principal / contraste alto
        // Modo oscuro
        deepBrown: '#2B211B',   // fondo principal oscuro
        burntOrange: '#B5651D', // acento cálido principal oscuro
        mustard: '#C9A24B',     // acento mostaza
        mutedBeige: '#A69783',  // texto suave / muted
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Georgia', 'serif'],
      },
      boxShadow: {
        warm: '0 8px 24px -8px rgba(107,79,59,0.25)',
        warmDark: '0 8px 24px -8px rgba(181,101,29,0.35)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
