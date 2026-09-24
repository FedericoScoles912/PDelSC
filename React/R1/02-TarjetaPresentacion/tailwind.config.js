/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          beige: '#F5F0E1',
          crema: '#FFF8E7',
          terracota: '#C97B63',
          oliva: '#6B705C',
          marron: '#A68A64'
        },
        dark: {
          chocolate: '#3E2723',
          mostaza: '#B08968',
          borgona: '#6D2E46',
          gris: '#4A403A',
          crema: '#D4A373'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
