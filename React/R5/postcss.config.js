/**
 * PostCSS: TailwindCSS + Autoprefixer.
 * La configuración de Tailwind vive en /src/Styles (junto al resto de estilos),
 * por eso se indica su ruta explícitamente.
 */
export default {
  plugins: {
    tailwindcss: { config: './src/Styles/tailwind.config.js' },
    autoprefixer: {},
  },
};
