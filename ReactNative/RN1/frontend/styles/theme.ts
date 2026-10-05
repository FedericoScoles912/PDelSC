/**
 * Paletas de Colores Otoñales - Modo Claro y Oscuro
 * Definición central de tokens de diseño para la aplicación.
 */

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  border: string;
  borderFocus: string;
  error: string;
  errorBackground: string;
  success: string;
  successBackground: string;
  info: string;
  infoBackground: string;
  inputBg: string;
  shadow: string;
}

export const lightTheme: ColorPalette = {
  background: '#F5EBDD',      // Crema otoñal
  surface: '#FBF4E9',         // Superficie cálida
  surfaceVariant: '#EFE2D1',  // Superficie alternativa
  text: '#4A3426',            // Marrón café oscuro para alto contraste AA
  textSecondary: '#6B4F3B',   // Marrón medio
  textMuted: '#8C7260',       // Marrón suave
  primary: '#B5651D',         // Terracota
  primaryHover: '#9E5616',    // Terracota oscuro
  secondary: '#D9A441',       // Ocre
  accent: '#7A8450',          // Verde oliva
  border: '#E3D2BC',          // Borde sutil
  borderFocus: '#B5651D',     // Borde activo terracota
  error: '#BA3B28',           // Rojo ladrillo
  errorBackground: '#FDEEE9', // Fondo de error suave
  success: '#5B7A42',         // Verde bosque cálido
  successBackground: '#EDF4E7',
  info: '#4B738A',            // Azul pizarra cálido
  infoBackground: '#E8F1F5',
  inputBg: '#FFFDF9',         // Fondo de inputs blanco crema
  shadow: 'rgba(74, 52, 38, 0.08)',
};

export const darkTheme: ColorPalette = {
  background: '#2B211B',      // Marrón café profundo
  surface: '#3A2D25',         // Superficie marrón cálida
  surfaceVariant: '#46372E',  // Superficie secundaria
  text: '#EADBC8',            // Crema claro para contraste AA
  textSecondary: '#D1BEA8',   // Crema suave
  textMuted: '#A6927E',       // Crema apagado
  primary: '#D98E3F',         // Ámbar
  primaryHover: '#E59F54',    // Ámbar luminoso
  secondary: '#B86B3C',       // Cobre
  accent: '#8E9A5B',          // Verde musgo
  border: '#52413A',          // Borde café suave
  borderFocus: '#D98E3F',     // Borde activo ámbar
  error: '#E06B52',           // Coral suave
  errorBackground: '#4A2A24',
  success: '#7FA65F',         // Verde musgo brillante
  successBackground: '#2E3B26',
  info: '#6E9BB8',            // Azul acero cálido
  infoBackground: '#293740',
  inputBg: '#322620',         // Fondo de inputs café oscuro
  shadow: 'rgba(0, 0, 0, 0.45)',
};

export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
