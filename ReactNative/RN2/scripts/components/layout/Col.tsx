import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface ColProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3 | 4; // manual columns span
  flex?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de columna con cálculo porcentual según breakpoint actual o span manual.
 */
export const Col: React.FC<ColProps> = ({ children, span, flex, style }) => {
  const { columns, isMobile } = useBreakpoint();

  let widthPercent: DimensionValue = '100%';

  if (span) {
    if (isMobile) {
      widthPercent = '100%';
    } else {
      widthPercent = `${(span / 4) * 100}%` as DimensionValue;
    }
  } else {
    // Cálculo automático según grilla del breakpoint
    if (columns === 1) {
      widthPercent = '100%';
    } else if (columns === 2) {
      widthPercent = '48.5%';
    } else if (columns === 3) {
      widthPercent = '31.8%';
    } else if (columns === 4) {
      widthPercent = '23.5%';
    }
  }

  return (
    <View
      style={[
        styles.col,
        {
          width: flex !== undefined ? undefined : widthPercent,
          flex: flex,
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
    minWidth: 260,
  },
});
