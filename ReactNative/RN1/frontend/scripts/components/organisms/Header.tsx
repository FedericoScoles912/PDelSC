import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Label } from '../atoms/Label';
import { Icon } from '../atoms/Icon';
import { ThemeToggle } from '../molecules/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Organismo Header: Barra superior con identidad visual otoñal y conmutador de tema
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'Portal de Acceso',
  subtitle,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.brandContainer}>
        <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
          <Icon name="shield-checkmark" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Label variant="h3" weight="bold" color={theme.text}>
            {title}
          </Label>
          {subtitle && (
            <Label variant="caption" color={theme.textSecondary}>
              {subtitle}
            </Label>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <ThemeToggle showLabel={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    width: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
