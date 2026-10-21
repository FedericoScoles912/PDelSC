/**
 * Button.js
 * Botón con variantes. Usa Pressable (sin estados `active:` frágiles:
 * calculamos el estilo presionado manualmente para máxima compatibilidad).
 */
import { ActivityIndicator, Pressable, Text as RNText, View } from 'react-native';
import { cn } from '../../Utils/cn';
import { Icon } from './Icon';

const VARIANTS = {
  primary: 'bg-brand-600 border-brand-600',
  secondary: 'bg-warm-100 border-warm-300 dark:bg-warm-800 dark:border-warm-600',
  outline: 'bg-transparent border-brand-600',
  ghost: 'bg-transparent border-transparent',
  danger: 'bg-danger border-danger',
  success: 'bg-success border-success',
  accent: 'bg-accent-500 border-accent-500',
};

const TEXTS = {
  primary: 'text-white',
  secondary: 'text-warm-800 dark:text-warm-100',
  outline: 'text-brand-700 dark:text-brand-300',
  ghost: 'text-warm-700 dark:text-warm-200',
  danger: 'text-white',
  success: 'text-white',
  accent: 'text-white',
};

const SIZES = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-4 py-2.5 rounded-xl',
  lg: 'px-6 py-3.5 rounded-xl',
};

const TEXT_SIZES = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

/**
 * @param {{variant?:keyof typeof VARIANTS, size?:keyof typeof SIZES, loading?:boolean,
 *   disabled?:boolean, icon?:string, fullWidth?:boolean, className?:string, label?:string,
 *   children?:React.ReactNode, onPress?:Function}} props
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className,
  label,
  children,
  onPress,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center border',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      style={({ pressed }) => (pressed && !isDisabled ? { opacity: 0.85 } : undefined)}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' || variant === 'ghost' || variant === 'outline' ? '#A8552F' : '#FFFFFF'} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} className={TEXTS[variant]} /> : null}
          <RNText className={cn('font-semibold', TEXT_SIZES[size], TEXTS[variant])}>
            {label ?? children}
          </RNText>
        </View>
      )}
    </Pressable>
  );
}

export default Button;
