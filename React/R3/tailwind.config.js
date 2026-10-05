/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        autumn: {
          terracotta: {
            DEFAULT: '#C85A32',
            light: '#E07A5F',
            dark: '#A63F19',
            hover: '#B84E27',
          },
          mustard: {
            DEFAULT: '#D49B27',
            light: '#E9C46A',
            dark: '#B57E15',
          },
          olive: {
            DEFAULT: '#606C38',
            light: '#8B9B58',
            dark: '#283618',
          },
          warmbrown: {
            DEFAULT: '#5C3A21',
            light: '#7F5539',
            dark: '#3D2514',
          },
          beige: {
            50: '#FAF8F5',
            100: '#F5EFEB',
            200: '#EBDDCF',
            300: '#DEC9B5',
            400: '#CDB198',
            DEFAULT: '#F5EFEB',
          },
          darkbg: {
            DEFAULT: '#1E1916', // Fondo cálido oscuro otoñal
            card: '#29221D',    // Tarjeta modo oscuro otoñal
            hover: '#352D26',
            border: '#4A3D34',
          },
          darktext: {
            primary: '#F7F3EE',
            secondary: '#D6C8BC',
            muted: '#A89789',
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'autumn-sm': '0 2px 8px rgba(92, 58, 33, 0.08)',
        'autumn': '0 8px 24px rgba(92, 58, 33, 0.12)',
        'autumn-dark': '0 8px 24px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
