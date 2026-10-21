import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { ThemeMode } from '../../types/theme';

export interface ThemeToggleProps {
  compact?: boolean;
}

/**
 * Control selector de modo claro, oscuro y seguir al sistema.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { mode, isDark, toggleTheme, setThemeMode, theme } = useTheme();

  if (compact) {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Cambiar tema de la aplicación"
        style={[
          styles.compactBtn,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.borderRadius.full,
          },
        ]}
      >
        <Icon
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={20}
          color={isDark ? theme.colors.primary : theme.colors.text}
        />
      </TouchableOpacity>
    );
  }

  const modes: { label: string; value: ThemeMode; icon: 'sunny-outline' | 'moon-outline' | 'phone-portrait-outline' }[] = [
    { label: 'Claro', value: 'light', icon: 'sunny-outline' },
    { label: 'Oscuro', value: 'dark', icon: 'moon-outline' },
    { label: 'Sistema', value: 'system', icon: 'phone-portrait-outline' },
  ];

  return (
    <View
      style={[
        styles.segmentedContainer,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.borderRadius.md,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {modes.map((item) => {
        const isSelected = mode === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            onPress={() => setThemeMode(item.value)}
            accessibilityRole="button"
            accessibilityLabel={`Tema ${item.label}`}
            style={[
              styles.segmentItem,
              {
                borderRadius: theme.borderRadius.sm,
                backgroundColor: isSelected ? theme.colors.surface : 'transparent',
              },
            ]}
          >
            <Icon
              name={item.icon}
              size={18}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              variant="bodySm"
              weight={isSelected ? 'bold' : 'medium'}
              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  compactBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    width: '100%',
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 8,
  },
});
