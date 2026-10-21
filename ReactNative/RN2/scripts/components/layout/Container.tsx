import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface ContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Contenedor responsivo que adapta márgenes y anchos máximos según el dispositivo.
 */
export const Container: React.FC<ContainerProps> = ({ children, fluid = false, style }) => {
  const { theme } = useTheme();
  const { isDesktop } = useBreakpoint();

  return (
    <View
      style={[
        styles.base,
        {
          paddingHorizontal: isDesktop ? theme.spacing.xl : theme.spacing.md,
          maxWidth: fluid ? '100%' : 1600,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
  },
});
