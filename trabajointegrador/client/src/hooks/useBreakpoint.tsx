/**
 * @file Hook de layout responsive. Reemplaza a las clases de grilla de
 *       Bootstrap mediante breakpoints equivalentes y una grilla propia de
 *       12 columnas.
 * @module client/src/hooks/useBreakpoint
 */

import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/** Nombres de breakpoint (equivalentes a Bootstrap). */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Ancho mínimo (px) de cada breakpoint, de menor a mayor. */
export const BREAKPOINTS: ReadonlyArray<{ nombre: Breakpoint; min: number }> = [
  { nombre: 'xs', min: 0 },
  { nombre: 'sm', min: 576 },
  { nombre: 'md', min: 768 },
  { nombre: 'lg', min: 992 },
  { nombre: 'xl', min: 1200 }
];

/** Ancho de referencia para el que se diseña el layout de escritorio. */
export const ANCHO_ESCRITORIO = 1920;

/** Cantidad total de columnas de la grilla. */
export const COLUMNAS_GRILLA = 12;

/** Resultado de {@link useBreakpoint}. */
export interface ResultadoBreakpoint {
  /** Ancho actual de la ventana en px. */
  ancho: number;
  /** Alto actual de la ventana en px. */
  alto: number;
  /** Breakpoint activo. */
  breakpoint: Breakpoint;
  /** `true` en teléfonos (xs). */
  esTelefono: boolean;
  /** `true` en tablets (sm/md). */
  esTablet: boolean;
  /** `true` en escritorio (lg/xl). */
  esEscritorio: boolean;
  /** `true` cuando la barra lateral debe mostrarse. */
  usarSidebar: boolean;
  /** `true` cuando la barra lateral debe mostrarse sólo con iconos. */
  sidebarCompacta: boolean;
  /** Devuelve `true` si el ancho alcanza el breakpoint indicado. */
  alMenos: (breakpoint: Breakpoint) => boolean;
  /**
   * Calcula el ancho en pixeles de `columnas` columnas de la grilla de 12,
   * descontando `separacion` px de gutter entre columnas.
   */
  anchoColumnas: (columnas: number, separacion?: number, columnasTotales?: number) => number;
}

/** Ancho mínimo del contenedor de contenido en escritorio. */
const ANCHO_MINIMO_COLUMNA = 0;

/**
 * Observa el tamaño de la ventana y expone helpers de grilla.
 * @returns {ResultadoBreakpoint}
 */
export function useBreakpoint(): ResultadoBreakpoint {
  const { width, height } = useWindowDimensions();

  const breakpoint = useMemo<Breakpoint>(() => {
    let activo: Breakpoint = 'xs';
    for (const bp of BREAKPOINTS) {
      if (width >= bp.min) activo = bp.nombre;
    }
    return activo;
  }, [width]);

  const alMenos = useCallback(
    (objetivo: Breakpoint) => {
      const encontrado = BREAKPOINTS.find((bp) => bp.nombre === objetivo);
      return width >= (encontrado?.min ?? 0);
    },
    [width]
  );

  const anchoColumnas = useCallback(
    (columnas: number, separacion = 16, columnasTotales = COLUMNAS_GRILLA) => {
      const proporcion = Math.min(Math.max(columnas, 0), columnasTotales) / columnasTotales;
      const total = width * proporcion;
      const gutters = separacion * Math.max(columnas - 1, 0);
      return Math.max(ANCHO_MINIMO_COLUMNA, Math.round(total - gutters));
    },
    [width]
  );

  return {
    ancho: width,
    alto: height,
    breakpoint,
    esTelefono: breakpoint === 'xs',
    esTablet: breakpoint === 'sm' || breakpoint === 'md',
    esEscritorio: breakpoint === 'lg' || breakpoint === 'xl',
    usarSidebar: width >= 768,
    sidebarCompacta: width >= 768 && width < 992,
    alMenos,
    anchoColumnas
  };
}
