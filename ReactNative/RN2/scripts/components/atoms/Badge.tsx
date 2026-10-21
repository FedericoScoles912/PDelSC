import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

/**
 * Átomo de distintivo visual para estados de permisos y sensores.
 */
export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', size = 'sm' }) => {
  const { theme } = useTheme();

  let bg = theme.colors.surfaceMuted;
  let textCol = theme.colors.textSecondary;

  if (variant === 'success') {
    bg = theme.colors.successBackground;
    textCol = theme.colors.success;
  } else if (variant === 'warning') {
    bg = theme.colors.warningBackground;
    textCol = theme.colors.warning;
  } else if (variant === 'error') {
    bg = theme.colors.errorBackground;
    textCol = theme.colors.error;
  } else if (variant === 'info') {
    bg = theme.colors.infoBackground;
    textCol = theme.colors.info;
  }

  const paddingVertical = size === 'sm' ? 2 : 4;
  const paddingHorizontal = size === 'sm' ? theme.spacing.xs : theme.spacing.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical,
          paddingHorizontal,
          borderRadius: theme.borderRadius.full,
        },
      ]}
    >
      <Text variant="caption" weight="bold" color={textCol}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
