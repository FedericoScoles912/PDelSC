import { useWindowDimensions } from 'react-native';
import { Breakpoint } from '../types';
import { BREAKPOINT_VALUES } from '../utils/constants';

export interface BreakpointInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isXxl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
}

/**
 * Hook para detección dinámica de breakpoints equivalentes a Bootstrap
 * (xs <576, sm ≥576, md ≥768, lg ≥992, xl ≥1200, xxl ≥1400)
 */
export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  let breakpoint: Breakpoint = 'xs';

  if (width >= BREAKPOINT_VALUES.xxl) {
    breakpoint = 'xxl';
  } else if (width >= BREAKPOINT_VALUES.xl) {
    breakpoint = 'xl';
  } else if (width >= BREAKPOINT_VALUES.lg) {
    breakpoint = 'lg';
  } else if (width >= BREAKPOINT_VALUES.md) {
    breakpoint = 'md';
  } else if (width >= BREAKPOINT_VALUES.sm) {
    breakpoint = 'sm';
  } else {
    breakpoint = 'xs';
  }

  return {
    width,
    height,
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    isXxl: breakpoint === 'xxl',
    isMobile: width < BREAKPOINT_VALUES.md, // < 768px
    isTablet: width >= BREAKPOINT_VALUES.md && width < BREAKPOINT_VALUES.lg,
    isDesktop: width >= BREAKPOINT_VALUES.lg,
    isWideDesktop: width >= 1920,
  };
}
