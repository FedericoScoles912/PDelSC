import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface RowProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  gutter?: number;
}

/**
 * Componente Grid Row: Fila flexible que envuelve columnas con soporte para canaletas (gutters)
 */
export const Row: React.FC<RowProps> = ({
  children,
  style,
  gutter = 16,
}) => {
  return (
    <View
      style={[
        styles.row,
        {
          marginHorizontal: -(gutter / 2),
        },
        style,
      ]}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ gutter?: number }>, {
          gutter,
        });
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
