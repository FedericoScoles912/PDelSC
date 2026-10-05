import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Label } from './Label';
import { Spinner } from './Spinner';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  accessibilityLabel: string;
}

/**
 * Átomo Button: Botón interactivo con variantes visuales, estado de carga,
 * y cumplimiento de accesibilidad con tamaño táctil mínimo garantizado de 48px.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = (pressed: boolean): string => {
    if (disabled || isLoading) {
      return variant === 'outline' ? 'transparent' : theme.surfaceVariant;
    }

    switch (variant) {
      case 'primary':
        return pressed ? theme.primaryHover : theme.primary;
      case 'secondary':
        return pressed ? theme.accent : theme.secondary;
      case 'danger':
        return pressed ? '#9E2F1F' : theme.error;
      case 'outline':
      default:
        return pressed ? theme.surfaceVariant : 'transparent';
    }
  };

  const getTextColor = (): string => {
    if (disabled || isLoading) return theme.textMuted;

    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      default:
        return theme.primary;
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') {
      return disabled ? theme.border : theme.primary;
    }
    return 'transparent';
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: disabled && variant !== 'outline' ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <Spinner size="small" color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconMargin}>{leftIcon}</View>}
          <Label
            variant="body"
            weight="semibold"
            color={getTextColor()}
            style={textStyle}
          >
            {title}
          </Label>
          {rightIcon && <View style={styles.iconMargin}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginHorizontal: 6,
  },
});
