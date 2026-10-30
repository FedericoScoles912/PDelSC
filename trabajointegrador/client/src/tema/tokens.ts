/**
 * @file Tokens de color del tema (paleta cálida otoñal).
 *
 * Se exportan como valores hex porque se necesitan desde JavaScript (no sólo
 * desde clases de Tailwind): tema de React Navigation, `StatusBar`, iconos y
 * gráficos. Los mismos valores viven en `global.css` como variables CSS para
 * que las clases `bg-*` / `text-*` de NativeWind respeten el tema activo.
 * @module client/src/tema/tokens
 */

/** Esquema de color global. */
export type Esquema = 'claro' | 'oscuro';

/** Conjunto completo de colores semánticos. */
export interface TokensColor {
  /** Fondo general de la aplicación. */
  fondo: string;
  /** Fondo de tarjetas y paneles. */
  superficie: string;
  /** Fondo secundario (filas alternas, encabezados de tabla). */
  superficieAlt: string;
  /** Bordes y separadores. */
  borde: string;
  /** Texto principal. */
  texto: string;
  /** Texto secundario / etiquetas. */
  textoSuave: string;
  /** Color de marca. */
  primario: string;
  /** Variante clara del color de marca. */
  primarioSuave: string;
  /** Color de acento (ámbar). */
  acento: string;
  /** Estado de éxito. */
  exito: string;
  /** Estado de advertencia. */
  advertencia: string;
  /** Estado de error. */
  peligro: string;
  /** Estado informativo. */
  info: string;
  /** Color de sombras y superposiciones. */
  sombra: string;
  /** Texto sobre color primario. */
  sobrePrimario: string;
}

/** Tokens de color para cada esquema. */
export const TOKENS: Record<Esquema, TokensColor> = {
  claro: {
    fondo: '#FBF7F0',
    superficie: '#FFFFFF',
    superficieAlt: '#F5EDE1',
    borde: '#E8DDCC',
    texto: '#2E2419',
    textoSuave: '#7A6A57',
    primario: '#C0562A',
    primarioSuave: '#E07A45',
    acento: '#E0A33E',
    exito: '#4E7C4A',
    advertencia: '#C7791B',
    peligro: '#B3261E',
    info: '#3A6E8A',
    sombra: 'rgba(46, 36, 25, 0.14)',
    sobrePrimario: '#FFFFFF'
  },
  oscuro: {
    fondo: '#1A1512',
    superficie: '#241D18',
    superficieAlt: '#2E251E',
    borde: '#3B2F26',
    texto: '#F3E9DC',
    textoSuave: '#B9A795',
    primario: '#E07A45',
    primarioSuave: '#E99364',
    acento: '#E9B75C',
    exito: '#7AA874',
    advertencia: '#E0A33E',
    peligro: '#E26A60',
    info: '#6CA0BE',
    sombra: 'rgba(0, 0, 0, 0.45)',
    sobrePrimario: '#1A1512'
  }
};

/** Devuelve el juego de tokens del esquema indicado. */
export function tokensDe(esquema: Esquema): TokensColor {
  return TOKENS[esquema];
}
