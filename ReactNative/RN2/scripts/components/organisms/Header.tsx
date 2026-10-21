import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { ThemeToggle } from '../molecules/ThemeToggle';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showThemeToggle?: boolean;
  actions?: React.ReactNode;
}

/**
 * Organismo de cabecera superior con título, subtítulo descriptivo y toggle de tema rápido.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showThemeToggle = true,
  actions,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Text variant="headline" weight="bold">
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySm" secondary style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {actions}
        {showThemeToggle && <ThemeToggle compact />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    minHeight: 64,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
