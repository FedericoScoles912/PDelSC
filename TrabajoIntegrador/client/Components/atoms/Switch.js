/**
 * Switch.js
 * Interruptor booleano con etiqueta opcional.
 */
import { Switch as RNSwitch, View } from 'react-native';
import { Text } from './Text';

export function Switch({ label, value, onValueChange, className }) {
  return (
    <View className={`mb-3 flex-row items-center justify-between ${className || ''}`}>
      {label ? <Text variant="label">{label}</Text> : null}
      <RNSwitch
        value={!!value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D6C9B4', true: '#CE8756' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default Switch;
