import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Configuración de TailwindCSS.
 *
 * Los colores NO llevan valores fijos: apuntan a variables CSS definidas en
 * /src/Styles/index.css, que cambian entre modo claro y oscuro. Así, cambiar
 * de tema no requiere duplicar clases (`dark:`) en cada componente.
 *
 * Paleta: tonos otoñales (terracota, mostaza, marrón cálido, beige, verde oliva).
 */
const stylesDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(stylesDir, '..', '..');
const toGlob = (relative) => path.join(projectRoot, relative).replace(/\\/g, '/');

/** Color que lee su canal RGB de una variable CSS (permite opacidad). */
const token = (variable) => `rgb(var(--c-${variable}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [toGlob('index.html'), toGlob('src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        'surface-alt': token('surface-alt'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        primary: token('primary'),
        'primary-hover': token('primary-hover'),
        'primary-on': token('primary-on'),
        accent: token('accent'),
        'accent-on': token('accent-on'),
        olive: token('olive'),
        'olive-hover': token('olive-hover'),
        'olive-on': token('olive-on'),
        danger: token('danger'),
        'danger-hover': token('danger-hover'),
        'danger-on': token('danger-on'),
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--c-shadow) / 0.06), 0 8px 24px -12px rgb(var(--c-shadow) / 0.18)',
        modal: '0 24px 64px -16px rgb(var(--c-shadow) / 0.45)',
        focus: '0 0 0 3px rgb(var(--c-primary) / 0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'pop-in': 'pop-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 260ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
