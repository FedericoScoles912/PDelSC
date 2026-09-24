/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bg-primary':      'var(--bg-primary)',
        'bg-secondary':    'var(--bg-secondary)',
        'bg-tertiary':     'var(--bg-tertiary)',
        'surface':         'var(--surface)',
        'surface-hover':   'var(--surface-hover)',
        'text-primary':    'var(--text-primary)',
        'text-secondary':  'var(--text-secondary)',
        'text-muted':      'var(--text-muted)',
        'accent-primary':  'var(--accent-primary)',
        'accent-secondary':'var(--accent-secondary)',
        'accent-tertiary': 'var(--accent-tertiary)',
        'accent-success':  'var(--accent-success)',
        'accent-error':    'var(--accent-error)',
        'accent-warning':  'var(--accent-warning)',
        'border-subtle':   'var(--border-subtle)',
        'border-strong':   'var(--border-strong)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 10px 30px -12px rgba(128, 70, 40, 0.18)',
        card: '0 2px 10px -2px rgba(60, 40, 20, 0.12)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
