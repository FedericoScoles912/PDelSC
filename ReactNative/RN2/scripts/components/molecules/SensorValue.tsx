import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { formatSensorValue } from '../../utils/formatters';

export interface SensorValueProps {
  axis: 'X' | 'Y' | 'Z';
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
}

/**
 * Molécula que muestra el valor numérico de un eje sensorial junto con una barra de balance visual interactiva.
 */
export const SensorValue: React.FC<SensorValueProps> = ({
  axis,
  value,
  min = -1.5,
  max = 1.5,
  unit,
  color,
}) => {
  const { theme } = useTheme();
  const barColor = color ?? (axis === 'X' ? theme.colors.primary : axis === 'Y' ? theme.colors.secondary : theme.colors.accent);

  // Normalizar valor entre -1 y +1 relativo a min y max
  const range = Math.max(Math.abs(min), Math.abs(max));
  const clamped = Math.max(-range, Math.min(range, value));
  const percentage = (clamped / range) * 50; // -50% a +50% desde el centro

  const isPositive = percentage >= 0;
  const barWidth = Math.abs(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.axisBadge}>
          <Text variant="bodySm" weight="bold" color={barColor}>
            Eje {axis}
          </Text>
        </View>

        <Text variant="body" weight="semibold">
          {formatSensorValue(value)}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>

      {/* Barra de balance centrada en 0 */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.borderRadius.sm,
          },
        ]}
      >
        <View style={[styles.centerLine, { backgroundColor: theme.colors.border }]} />

        {isPositive ? (
          <View
            style={[
              styles.fill,
              {
                left: '50%',
                width: `${barWidth}%`,
                backgroundColor: barColor,
                borderTopRightRadius: theme.borderRadius.xs,
                borderBottomRightRadius: theme.borderRadius.xs,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.fill,
              {
                right: '50%',
                width: `${barWidth}%`,
                backgroundColor: barColor,
                borderTopLeftRadius: theme.borderRadius.xs,
                borderBottomLeftRadius: theme.borderRadius.xs,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  axisBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    height: 10,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 2,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
});
