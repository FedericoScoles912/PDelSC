/**
 * @file Configuración de TailwindCSS para NativeWind v4.
 *       Los colores semánticos apuntan a variables CSS definidas en
 *       `global.css`, de modo que cambiar de tema sólo alterna la clase
 *       `dark` en la raíz de la aplicación.
 * @type {import('tailwindcss').Config}
 */

module.exports = {
  darkMode: 'class',
  content: ['./App.tsx', './index.ts', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        fondo: 'rgb(var(--color-fondo) / <alpha-value>)',
        superficie: 'rgb(var(--color-superficie) / <alpha-value>)',
        'superficie-alt': 'rgb(var(--color-superficie-alt) / <alpha-value>)',
        borde: 'rgb(var(--color-borde) / <alpha-value>)',
        texto: 'rgb(var(--color-texto) / <alpha-value>)',
        'texto-suave': 'rgb(var(--color-texto-suave) / <alpha-value>)',
        primario: {
          DEFAULT: 'rgb(var(--color-primario) / <alpha-value>)',
          suave: 'rgb(var(--color-primario-suave) / <alpha-value>)'
        },
        acento: 'rgb(var(--color-acento) / <alpha-value>)',
        exito: 'rgb(var(--color-exito) / <alpha-value>)',
        advertencia: 'rgb(var(--color-advertencia) / <alpha-value>)',
        peligro: 'rgb(var(--color-peligro) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)'
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px'
      },
      spacing: {
        sidebar: '248px',
        'sidebar-mini': '76px',
        topbar: '64px'
      }
    }
  },
  plugins: []
};
