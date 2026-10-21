import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface RowProps {
  children: React.ReactNode;
  gap?: number;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente de fila flexible con soporte de espaciado y envoltura.
 */
export const Row: React.FC<RowProps> = ({
  children,
  gap,
  justify = 'flex-start',
  align = 'center',
  wrap = true,
  style,
}) => {
  const { theme } = useTheme();
  const rowGap = gap ?? theme.spacing.md;

  return (
    <View
      style={[
        styles.row,
        {
          justifyContent: justify,
          alignItems: align,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: rowGap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
  },
});
