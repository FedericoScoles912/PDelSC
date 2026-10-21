import React from 'react';
import { Text as RNText, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'caption' | 'bodySm' | 'body' | 'bodyLg' | 'subtitle' | 'title' | 'headline' | 'display';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  secondary?: boolean;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/**
 * Átomo de texto tipográfico con variantes basadas en el tema activo.
 */
export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  secondary = false,
  align = 'left',
  numberOfLines,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  const textColor = color ?? (secondary ? theme.colors.textSecondary : theme.colors.text);
  const fontSize = theme.typography.fontSizes[variant];
  const lineHeight = theme.typography.lineHeights[variant];
  const fontWeight = theme.typography.fontWeights[weight];

  return (
    <RNText
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          color: textColor,
          fontSize,
          lineHeight,
          fontWeight,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
};
