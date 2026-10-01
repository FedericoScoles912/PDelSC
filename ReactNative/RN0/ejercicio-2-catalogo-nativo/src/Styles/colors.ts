/** Paletas centralizadas de tonos otoñales. */
export const palettes = {
  light: { background: '#F4EBDD', surface: '#FFF9F0', text: '#4B382E', muted: '#80695A', primary: '#B76E52', accent: '#78825A', border: '#DECAB6', overlay: 'rgba(45,32,29,0.55)' },
  dark: { background: '#2D201D', surface: '#402D29', text: '#F6E7CD', muted: '#C9AD94', primary: '#C28A4B', accent: '#A09958', border: '#67463C', overlay: 'rgba(0,0,0,0.7)' },
} as const;
export type AppColors = typeof palettes.light;
