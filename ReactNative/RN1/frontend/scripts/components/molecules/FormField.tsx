import React from 'react';
import { View, StyleSheet, TextInputProps } from 'react-native';
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { useTheme } from '../../hooks/useTheme';

export interface FormFieldProps extends Omit<InputProps, 'hasError'> {
  label: string;
  error?: string;
  required?: boolean;
}

/**
 * Molécula FormField: Compone Label, Input y mensaje de validación de error
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  ...inputProps
}) => {
  const { theme } = useTheme();

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
});
