import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Label } from '../atoms/Label';
import { Icon } from '../atoms/Icon';
import { useTheme } from '../../hooks/useTheme';

export interface InfoRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  highlight?: boolean;
}

/**
 * Molécula InfoRow: Muestra un registro de información estructurada con icono, etiqueta y valor
 */
export const InfoRow: React.FC<InfoRowProps> = ({
  iconName,
  label,
  value,
  highlight = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: highlight ? theme.surfaceVariant : theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: highlight ? theme.primary : theme.border,
          },
        ]}
      >
        <Icon
          name={iconName}
          size={18}
          color={highlight ? '#FFFFFF' : theme.textSecondary}
        />
      </View>
      <View style={styles.textContainer}>
        <Label variant="caption" weight="medium" color={theme.textSecondary}>
          {label}
        </Label>
        <Label variant="body" weight="semibold" color={theme.text}>
          {String(value)}
        </Label>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 6,
    width: '100%',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});
