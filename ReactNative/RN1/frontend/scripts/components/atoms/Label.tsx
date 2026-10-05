import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface LabelProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'subtext';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  style?: TextStyle | TextStyle[];
}

/**
 * Átomo Label: Componente tipográfico para textos, encabezados y etiquetas
 */
export const Label: React.FC<LabelProps> = ({
  children,
  variant = 'body',
  weight = 'normal',
  color,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getFontSize = (): number => {
    switch (variant) {
      case 'h1':
        return 32;
      case 'h2':
        return 24;
      case 'h3':
        return 20;
      case 'label':
        return 15;
      case 'caption':
        return 13;
      case 'subtext':
        return 14;
      case 'body':
      default:
        return 16;
    }
  };

  const getFontWeight = (): TextStyle['fontWeight'] => {
    switch (weight) {
      case 'bold':
        return '700';
      case 'semibold':
        return '600';
      case 'medium':
        return '500';
      case 'normal':
      default:
        return '400';
    }
  };

  const defaultColor = color || (variant === 'caption' || variant === 'subtext' ? theme.textSecondary : theme.text);

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color: defaultColor,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
    includeFontPadding: false,
  },
});
