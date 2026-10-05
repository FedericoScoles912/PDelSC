import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ColSpan, ResponsiveColSpan } from '../../types';

export interface ColProps extends ResponsiveColSpan {
  children: React.ReactNode;
  span?: ColSpan;
  gutter?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Componente Grid Col: Columna responsive de 12 divisiones equivalente a Bootstrap
 */
export const Col: React.FC<ColProps> = ({
  children,
  span = 12,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  gutter = 16,
  style,
}) => {
  const { breakpoint } = useBreakpoint();

  // Calcular el span efectivo según la cascada de breakpoints móviles -> escritorio
  const getActiveSpan = (): ColSpan => {
    switch (breakpoint) {
      case 'xxl':
        return xxl ?? xl ?? lg ?? md ?? sm ?? xs ?? span;
      case 'xl':
        return xl ?? lg ?? md ?? sm ?? xs ?? span;
      case 'lg':
        return lg ?? md ?? sm ?? xs ?? span;
      case 'md':
        return md ?? sm ?? xs ?? span;
      case 'sm':
        return sm ?? xs ?? span;
      case 'xs':
      default:
        return xs ?? span;
    }
  };

  const activeSpan = getActiveSpan();
  const widthPercentage: DimensionValue = `${(activeSpan / 12) * 100}%`;

  return (
    <View
      style={[
        styles.col,
        {
          width: widthPercentage,
          paddingHorizontal: gutter / 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  col: {
    paddingVertical: 8,
  },
});
