/**
 * responsive.js
 * Breakpoints y helpers para convivir entre Android (chico) y PC 1920x1080.
 * Usa useWindowDimensions de React Native (se recalcula al rotar/redimensionar).
 */
import { useWindowDimensions } from 'react-native';

/**
 * Breakpoints alineados con el sistema de grilla (estilo Bootstrap: sm/md/lg/xl/xxl).
 * Se usan tanto en helpers como en la grilla de 12 columnas (Components/atoms/Grid).
 */
export const breakpoints = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1440, xxl: 1600 };

/** Devuelve la clave de breakpoint activa para un ancho dado. */
export function breakpointFor(width) {
  if (width >= breakpoints.xxl) return 'xxl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * @returns {{width:number,height:number,breakpoint:string,isMobile:boolean,isTablet:boolean,isDesktop:boolean,isWide:boolean}}
 */
export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    breakpoint: breakpointFor(width),
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    isWide: width >= breakpoints.xl,
  };
}

export default { breakpoints, breakpointFor, useBreakpoint };
