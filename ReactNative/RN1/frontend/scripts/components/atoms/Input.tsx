import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface InputProps extends TextInputProps {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Átomo Input: Campo de texto con altura mínima accesible (48px),
 * estilos dinámicos de foco y error basados en el tema actual.
 */
export const Input: React.FC<InputProps> = ({
  hasError = false,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = (): string => {
    if (hasError) return theme.error;
    if (isFocused) return theme.borderFocus;
    return theme.border;
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.inputBg,
          borderColor: getBorderColor(),
          borderWidth: isFocused || hasError ? 2 : 1,
        },
      ]}
    >
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});
