/**
 * Spinner.js
 * Indicador de carga simple (ActivityIndicator con color del tema).
 */
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../Styles/ThemeProvider';
import { cn } from '../../Utils/cn';

export function Spinner({ size = 'small', className }) {
  const { tokens } = useTheme();
  return (
    <View className={cn('items-center justify-center', className)}>
      <ActivityIndicator size={size} color={tokens.primary} />
    </View>
  );
}

export default Spinner;
