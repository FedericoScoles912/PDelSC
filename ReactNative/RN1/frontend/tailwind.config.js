/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './App.{js,jsx,ts,tsx}',
    './scripts/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      xs: '0px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1400px',
    },
    extend: {
      colors: {
        autumn: {
          light: {
            bg: '#F5EBDD',
            surface: '#FBF4E9',
            text: '#4A3426',
            primary: '#B5651D',
            secondary: '#D9A441',
            accent: '#7A8450',
            border: '#E3D2BC',
          },
          dark: {
            bg: '#2B211B',
            surface: '#3A2D25',
            text: '#EADBC8',
            primary: '#D98E3F',
            secondary: '#B86B3C',
            accent: '#8E9A5B',
            border: '#52413A',
          },
        },
      },
    },
  },
  plugins: [],
};
