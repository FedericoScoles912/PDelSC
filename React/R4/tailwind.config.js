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
      // Paleta minimalista de alto contraste
      colors: {
        cream: '#F8FAFC',
        terracotta: '#0284C7',
        olive: '#0F766E',
        softBrown: '#0F172A',
        deepBrown: '#020617',
        burntOrange: '#38BDF8',
        mustard: '#7DD3FC',
        mutedBeige: '#CBD5E1',
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
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 8px 24px -8px rgba(15,23,42,0.16)',
        warmDark: '0 8px 24px -8px rgba(56,189,248,0.16)',
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
