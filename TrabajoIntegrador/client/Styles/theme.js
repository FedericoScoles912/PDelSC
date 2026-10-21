/**
 * theme.js
 * Tokens de diseño en JavaScript (mismos valores que tailwind.config.js).
 * Se usan donde las clases de NativeWind no llegan: StatusBar, colores de
 * gráficos, sombras nativas, etc. Centralizar acá evita colores "a mano".
 */

export const palette = {
  brand: {
    50: '#FBF5EF', 100: '#F5E6D8', 200: '#EACBB0', 300: '#DDAA82',
    400: '#CE8756', 500: '#C06B3E', 600: '#A8552F', 700: '#8A4427',
    800: '#6E3722', 900: '#5A2E1E',
  },
  accent: {
    300: '#E7B954', 400: '#E0A33E', 500: '#C9862B', 600: '#A3681F',
  },
  warm: {
    50: '#FAF7F2', 100: '#F3EDE4', 200: '#E7DECF', 300: '#D6C9B4',
    400: '#B9A98E', 500: '#9A886B', 600: '#7A6A51', 700: '#5C4F3D',
    800: '#3A3228', 900: '#241F19', 950: '#1B1714',
  },
  success: '#4C8C4A',
  warning: '#D98A2B',
  danger: '#B4432E',
  info: '#4A7C8C',
};

/** Superficies y textos por esquema. */
export const themes = {
  light: {
    scheme: 'light',
    background: palette.warm[50],
    surface: '#FFFFFF',
    surfaceAlt: palette.warm[100],
    border: palette.warm[200],
    text: palette.warm[900],
    textMuted: palette.warm[600],
    primary: palette.brand[600],
    primaryText: '#FFFFFF',
    sidebarBg: palette.warm[900],
    sidebarText: palette.warm[100],
    sidebarActive: palette.brand[600],
    statusBar: 'dark',
  },
  dark: {
    scheme: 'dark',
    background: palette.warm[950],
    surface: palette.warm[900],
    surfaceAlt: palette.warm[800],
    border: palette.warm[700],
    text: palette.warm[50],
    textMuted: palette.warm[400],
    primary: palette.brand[400],
    primaryText: palette.warm[950],
    sidebarBg: '#120F0C',
    sidebarText: palette.warm[300],
    sidebarActive: palette.brand[500],
    statusBar: 'light',
  },
};

/** Paleta categórica para gráficos (dashboard/reportes). */
export const chartColors = [
  palette.brand[500], palette.accent[400], palette.info,
  palette.success, palette.danger, palette.warm[500],
];

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export default { palette, themes, chartColors, spacing };
