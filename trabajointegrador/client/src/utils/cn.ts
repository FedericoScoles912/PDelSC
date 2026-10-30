/**
 * @file Utilidad mínima para componer clases de Tailwind/NativeWind.
 * @module client/src/utils/cn
 */

/** Une clases ignorando valores falsy. */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ');
}
