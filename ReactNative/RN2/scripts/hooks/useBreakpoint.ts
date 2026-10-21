import { useWindowDimensions } from 'react-native';
import { breakpoints, BreakpointKey } from '../../styles/theme';

export interface BreakpointInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  breakpoint: BreakpointKey;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isXxl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  columns: number;
}

/**
 * Hook de sistema responsivo basado en las dimensiones actuales de la ventana.
 * Sostiene orientación vertical, horizontal y pantallas ultra-anchas hasta 1920x1080.
 */
export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  let breakpoint: BreakpointKey = 'xs';
  let columns = 1;

  if (width >= breakpoints.xxl) {
    breakpoint = 'xxl';
    columns = 4;
  } else if (width >= breakpoints.xl) {
    breakpoint = 'xl';
    columns = 3;
  } else if (width >= breakpoints.lg) {
    breakpoint = 'lg';
    columns = 3;
  } else if (width >= breakpoints.md) {
    breakpoint = 'md';
    columns = 2;
  } else if (width >= breakpoints.sm) {
    breakpoint = 'sm';
    columns = 2;
  } else {
    breakpoint = 'xs';
    columns = 1;
  }

  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  return {
    width,
    height,
    isLandscape,
    breakpoint,
    isXs: width < breakpoints.sm,
    isSm: width >= breakpoints.sm && width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl && width < breakpoints.xxl,
    isXxl: width >= breakpoints.xxl,
    isMobile,
    isTablet,
    isDesktop,
    columns,
  };
}
