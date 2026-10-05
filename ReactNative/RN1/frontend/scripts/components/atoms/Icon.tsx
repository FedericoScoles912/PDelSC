import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

/**
 * Átomo Icon: Renderiza iconos vectoriales accesibles de Ionicons
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  accessibilityLabel,
}) => {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessibilityLabel={accessibilityLabel}
    />
  );
};
