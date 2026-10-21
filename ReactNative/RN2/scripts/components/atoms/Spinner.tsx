import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './Text';

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  label?: string;
}

/**
 * Átomo de indicador de carga con etiqueta opcional.
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'small', color, label }) => {
  const { theme } = useTheme();
  const spinnerColor = color ?? theme.colors.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {label && (
        <Text variant="bodySm" secondary style={{ marginTop: theme.spacing.xs }}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
