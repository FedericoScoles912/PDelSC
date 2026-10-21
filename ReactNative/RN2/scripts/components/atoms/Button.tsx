import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';
import { Icon, IconName } from './Icon';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Átomo de botón accesible con área mínima táctil de 44px y estados activos.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  let backgroundColor = theme.colors.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = theme.colors.surface;
    textColor = theme.colors.text;
    borderColor = theme.colors.border;
    borderWidth = 1;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = theme.colors.primary;
    borderColor = theme.colors.primary;
    borderWidth = 1.5;
  } else if (variant === 'danger') {
    backgroundColor = theme.colors.error;
    textColor = '#FFFFFF';
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = theme.colors.text;
  }

  const height = size === 'sm' ? 44 : size === 'lg' ? 52 : 48;
  const paddingHorizontal = size === 'sm' ? theme.spacing.md : theme.spacing.lg;
  const iconSize = size === 'sm' ? 18 : 20;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={[
        styles.base,
        {
          minHeight: 44,
          height,
          backgroundColor: disabled ? theme.colors.border : backgroundColor,
          borderColor: disabled ? theme.colors.border : borderColor,
          borderWidth,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSize}
              color={disabled ? theme.colors.textSecondary : textColor}
              style={{ marginRight: theme.spacing.xs }}
            />
          )}
          <Text
            variant={size === 'sm' ? 'bodySm' : 'body'}
            weight="semibold"
            color={disabled ? theme.colors.textSecondary : textColor}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSize}
              color={disabled ? theme.colors.textSecondary : textColor}
              style={{ marginLeft: theme.spacing.xs }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
