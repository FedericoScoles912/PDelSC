/**
 * FormField.js
 * Etiqueta + control + mensaje de error/ayuda.
 */
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';

export function FormField({
  label, error, help, required = false, leftIcon, ...inputProps
}) {
  return (
    <View className="mb-3">
      {label ? (
        <Text variant="label" className="mb-1.5">
          {label}
          {required ? <Text className="text-danger"> *</Text> : null}
        </Text>
      ) : null}
      <Input leftIcon={leftIcon} error={!!error} {...inputProps} />
      {error ? (
        <Text variant="caption" className="mt-1 text-danger">{error}</Text>
      ) : help ? (
        <Text variant="caption" className="mt-1" muted>{help}</Text>
      ) : null}
    </View>
  );
}

export default FormField;
