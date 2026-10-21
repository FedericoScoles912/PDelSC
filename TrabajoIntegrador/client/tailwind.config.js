/**
 * tailwind.config.js
 * Tokens de diseño (paleta cálida otoñal) usados por NativeWind.
 * Los mismos valores en JS viven en ./Styles/theme.js para usarlos en props
 * que no aceptan clases (por ejemplo colores de StatusBar o gráficos).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.js',
    './index.js',
    './Screens/**/*.{js,jsx}',
    './Components/**/*.{js,jsx}',
    './Navigation/**/*.{js,jsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Marca: terracota cálido
        brand: {
          50: '#FBF5EF',
          100: '#F5E6D8',
          200: '#EACBB0',
          300: '#DDAA82',
          400: '#CE8756',
          500: '#C06B3E',
          600: '#A8552F',
          700: '#8A4427',
          800: '#6E3722',
          900: '#5A2E1E',
        },
        // Acento: dorado otoñal
        accent: {
          50: '#FDF7E7',
          100: '#F9E9C1',
          200: '#F1D28A',
          300: '#E7B954',
          400: '#E0A33E',
          500: '#C9862B',
          600: '#A3681F',
          700: '#7C4E18',
        },
        // Neutros cálidos
        warm: {
          50: '#FAF7F2',
          100: '#F3EDE4',
          200: '#E7DECF',
          300: '#D6C9B4',
          400: '#B9A98E',
          500: '#9A886B',
          600: '#7A6A51',
          700: '#5C4F3D',
          800: '#3A3228',
          900: '#241F19',
          950: '#1B1714',
        },
        // Estados
        success: { light: '#E4F0E3', DEFAULT: '#4C8C4A', dark: '#2F5E2D' },
        warning: { light: '#FBECD6', DEFAULT: '#D98A2B', dark: '#A5641B' },
        danger: { light: '#F6DFD9', DEFAULT: '#B4432E', dark: '#872F1F' },
        info: { light: '#DDEAEE', DEFAULT: '#4A7C8C', dark: '#335C69' },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
