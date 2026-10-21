import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Átomo de ícono vectorial basado en Ionicons y alineado con los colores del tema.
 */
export const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
  const { theme } = useTheme();
  const iconColor = color ?? theme.colors.text;

  return <Ionicons name={name} size={size} color={iconColor} style={style} />;
};
