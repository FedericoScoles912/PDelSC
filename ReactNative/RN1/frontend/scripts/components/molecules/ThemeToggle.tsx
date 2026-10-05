import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from '../atoms/Icon';
import { Label } from '../atoms/Label';

export interface ThemeToggleProps {
  showLabel?: boolean;
}

/**
 * Molécula ThemeToggle: Selector visual accesible para alternar entre Modo Claro y Oscuro
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = true }) => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      accessibilityHint="Alterna la paleta de colores de la interfaz"
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: isDark ? theme.primary : theme.secondary,
          },
        ]}
      >
        <Icon
          name={isDark ? 'moon' : 'sunny'}
          size={16}
          color="#FFFFFF"
        />
      </View>
      {showLabel && (
        <Label
          variant="caption"
          weight="semibold"
          color={theme.text}
          style={styles.label}
        >
          {isDark ? 'Modo Oscuro' : 'Modo Claro'}
        </Label>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 44,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
  },
});
