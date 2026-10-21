/**
 * Divider.js
 * Separador horizontal.
 */
import { View } from 'react-native';
import { cn } from '../../Utils/cn';

export function Divider({ className }) {
  return <View className={cn('h-px w-full bg-warm-200 dark:bg-warm-700', className)} />;
}

export default Divider;
