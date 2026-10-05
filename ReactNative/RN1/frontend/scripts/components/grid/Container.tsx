import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface ContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Componente Grid Container: Contenedor responsive con ancho máximo adaptativo
 * tipo Bootstrap o fluido (100% de ancho).
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false,
  style,
}) => {
  const { isXs, isSm, isMd, isLg, isXl, isXxl } = useBreakpoint();

  const getMaxWidth = (): DimensionValue => {
    if (fluid) return '100%';
    if (isXxl) return 1320;
    if (isXl) return 1140;
    if (isLg) return 960;
    if (isMd) return 720;
    if (isSm) return 540;
    return '100%';
  };

  return (
    <View
      style={[
        styles.container,
        {
          maxWidth: getMaxWidth(),
          width: '100%',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
});
