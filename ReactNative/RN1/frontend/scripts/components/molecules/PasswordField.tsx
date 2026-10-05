import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { Icon } from '../atoms/Icon';
import { useTheme } from '../../hooks/useTheme';

export interface PasswordFieldProps extends Omit<InputProps, 'hasError' | 'secureTextEntry'> {
  label: string;
  error?: string;
  required?: boolean;
}

/**
 * Molécula PasswordField: Campo de contraseña con alternador visual de visibilidad (ojo)
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  required = false,
  ...inputProps
}) => {
  const { theme } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const rightIcon = (
    <Pressable
      onPress={toggleVisibility}
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
      hitSlop={8}
      style={styles.eyeButton}
    >
      <Icon
        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        size={22}
        color={theme.textSecondary}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Label variant="label" weight="medium">
          {label}
        </Label>
        {required && (
          <Label variant="label" weight="bold" color={theme.error} style={styles.requiredAsterisk}>
            *
          </Label>
        )}
      </View>

      <Input
        hasError={Boolean(error)}
        secureTextEntry={!isPasswordVisible}
        rightIcon={rightIcon}
        accessibilityLabel={label}
        {...inputProps}
      />

      {Boolean(error) && (
        <Label
          variant="caption"
          weight="medium"
          color={theme.error}
          style={styles.errorText}
        >
          {error}
        </Label>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  requiredAsterisk: {
    marginLeft: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 2,
  },
  eyeButton: {
    padding: 6,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
