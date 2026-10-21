/**
 * Definición central de diseño, colores otoñales, tipografía, espaciados y breakpoints.
 * Cumple con contraste AA y evita blancos o negros puros.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  border: string;
  borderLight: string;
  error: string;
  errorBackground: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  info: string;
  infoBackground: string;
}

export const lightColors: ThemeColors = {
  background: '#F5EBDD',
  surface: '#FBF4E9',
  surfaceHover: '#EFE3D3',
  surfaceMuted: '#EDE1CF',
  text: '#4A3426',
  textSecondary: '#7A6658',
  primary: '#B5651D',
  primaryLight: '#C97A32',
  secondary: '#D9A441',
  accent: '#7A8450',
  border: '#E3D2BC',
  borderLight: '#ECE0D0',
  error: '#A8442F',
  errorBackground: '#F8E7E4',
  success: '#5B7B4C',
  successBackground: '#EAF2E7',
  warning: '#C68528',
  warningBackground: '#FAF1DE',
  info: '#4B7B94',
  infoBackground: '#E6EFF4',
};

export const darkColors: ThemeColors = {
  background: '#2B211B',
  surface: '#3A2D25',
  surfaceHover: '#4A3B32',
  surfaceMuted: '#32261F',
  text: '#EADBC8',
  textSecondary: '#BBA896',
  primary: '#D98E3F',
  primaryLight: '#E8A359',
  secondary: '#B86B3C',
  accent: '#8E9A5B',
  border: '#52413A',
  borderLight: '#635048',
  error: '#D0694F',
  errorBackground: '#442621',
  success: '#7FA86D',
  successBackground: '#263821',
  warning: '#E2A94C',
  warningBackground: '#42331C',
  info: '#689DBA',
  infoBackground: '#1E323E',
};

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontSizes: {
    caption: 12,
    bodySm: 14,
    body: 16,
    bodyLg: 18,
    subtitle: 20,
    title: 24,
    headline: 28,
    display: 34,
  },
  lineHeights: {
    caption: 16,
    bodySm: 20,
    body: 24,
    bodyLg: 26,
    subtitle: 28,
    title: 32,
    headline: 36,
    display: 42,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

export interface AppTheme {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  breakpoints: typeof breakpoints;
}
