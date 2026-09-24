/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        otoño: {
          claro: {
            beige: '#F5F1E8',
            crema: '#FAF6EC',
            terracota: '#C97B5E',
            terracotaSuave: '#D9A48C',
            oliva: '#8A9A5B',
            marron: '#A68A64'
          },
          oscuro: {
            chocolate: '#3E2723',
            chocolateSuave: '#5D4037',
            mostaza: '#B8860B',
            mostazaApagado: '#A8882B',
            borgoña: '#6B3A3E',
            grisCalido: '#4A4540'
          }
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
      }
    }
  },
  plugins: [],
  darkMode: 'class'
};
