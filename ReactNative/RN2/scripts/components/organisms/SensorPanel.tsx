import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { SensorValue } from '../molecules/SensorValue';
import { Sensor3DData } from '../../types/sensors';

export interface SensorPanelProps {
  title: string;
  subtitle?: string;
  icon: IconName;
  data: Sensor3DData;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
}

/**
 * Organismo para presentar lecturas tridimensionales (X, Y, Z) de acelerómetro, giroscopio o magnetómetro.
 */
export const SensorPanel: React.FC<SensorPanelProps> = ({
  title,
  subtitle,
  icon,
  data,
  min = -1.5,
  max = 1.5,
  unit,
  color,
}) => {
  const { theme } = useTheme();
  const themeColor = color ?? theme.colors.primary;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.borderRadius.sm,
            },
          ]}
        >
          <Icon name={icon} size={22} color={themeColor} />
        </View>

        <View style={styles.titleBox}>
          <Text variant="title" weight="bold">
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" secondary>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.valuesContainer}>
        <SensorValue axis="X" value={data.x} min={min} max={max} unit={unit} color={theme.colors.primary} />
        <SensorValue axis="Y" value={data.y} min={min} max={max} unit={unit} color={theme.colors.secondary} />
        <SensorValue axis="Z" value={data.z} min={min} max={max} unit={unit} color={theme.colors.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    marginVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleBox: {
    flex: 1,
  },
  valuesContainer: {
    marginTop: 4,
  },
});
