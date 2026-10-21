/**
 * Icon.js
 * Íconos por glifo unicode. Evita dependencias externas de íconos y se ve
 * consistente en Android y web.
 */
import { Text } from 'react-native';
import { cn } from '../../Utils/cn';

export const GLYPHS = {
  dashboard: '\u25A6',
  productos: '\u25A4',
  movimientos: '\u21C5',
  precios: '$',
  reportes: '\u2261',
  usuarios: '\u263A',
  auditoria: '\u2637',
  config: '\u2699',
  search: '\u2315',
  plus: '\uFF0B',
  close: '\u2715',
  edit: '\u270E',
  trash: '\u2717',
  sun: '\u2600',
  moon: '\u263E',
  menu: '\u2630',
  logout: '\u23FB',
  alert: '\u26A0',
  check: '\u2713',
  info: '\u2139',
  chevronDown: '\u25BE',
  chevronRight: '\u25B8',
  download: '\u2193',
  upload: '\u2191',
  refresh: '\u27F3',
  user: '\u25CF',
  lock: '\u26BF',
  arrowLeft: '\u2190',
};

/**
 * @param {{name:keyof typeof GLYPHS, size?:number, className?:string, color?:string}} props
 */
export function Icon({ name, size = 18, className, color, ...rest }) {
  return (
    <Text
      className={cn('text-warm-700 dark:text-warm-300', className)}
      style={{ fontSize: size, lineHeight: size + 2, color }}
      allowFontScaling={false}
      {...rest}
    >
      {GLYPHS[name] ?? '\u25CF'}
    </Text>
  );
}

export default Icon;
