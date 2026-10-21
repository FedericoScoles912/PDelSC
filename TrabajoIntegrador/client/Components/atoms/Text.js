/**
 * Text.js
 * Tipografía base con variantes. Respeta el modo claro/oscuro.
 */
import { Text as RNText } from 'react-native';
import { cn } from '../../Utils/cn';

const VARIANTS = {
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-semibold',
  body: 'text-base',
  label: 'text-sm font-medium',
  caption: 'text-xs',
  mono: 'text-sm font-mono',
};

/**
 * @param {{variant?:keyof typeof VARIANTS, muted?:boolean, className?:string}} props
 */
export function Text({ variant = 'body', muted = false, className, children, ...rest }) {
  return (
    <RNText
      className={cn(
        VARIANTS[variant] || VARIANTS.body,
        muted ? 'text-warm-600 dark:text-warm-400' : 'text-warm-900 dark:text-warm-50',
        className,
      )}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export default Text;
