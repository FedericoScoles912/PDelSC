/**
 * IconButton.js
 * Botón cuadrado sólo ícono (acciones de tablas/headers).
 */
import { Pressable } from 'react-native';
import { cn } from '../../Utils/cn';
import { Icon } from './Icon';

const VARIANTS = {
  default: 'border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-900',
  ghost: 'border-transparent bg-transparent',
  danger: 'border-danger bg-white dark:bg-warm-900',
};

export function IconButton({ name, size = 36, variant = 'default', iconSize, className, onPress, ...rest }) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'items-center justify-center rounded-lg border',
        VARIANTS[variant],
        className,
      )}
      style={({ pressed }) => ({ width: size, height: size, opacity: pressed ? 0.7 : 1 })}
      {...rest}
    >
      <Icon name={name} size={iconSize ?? Math.round(size * 0.5)} className={variant === 'danger' ? 'text-danger' : undefined} />
    </Pressable>
  );
}

export default IconButton;
