import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

/**
 * Átomo Spinner: Indicador de carga accesible que toma por defecto el color primario del tema
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'small', color }) => {
  const { theme } = useTheme();

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando información"
    >
      <ActivityIndicator size={size} color={color || theme.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
