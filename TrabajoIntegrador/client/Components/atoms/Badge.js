/**
 * Badge.js
 * Etiqueta de estado compacta.
 */
import { View } from 'react-native';
import { cn } from '../../Utils/cn';
import { Text } from './Text';

const TONES = {
  neutral: 'bg-warm-100 dark:bg-warm-800',
  success: 'bg-success-light dark:bg-success-dark',
  warning: 'bg-warning-light dark:bg-warning-dark',
  danger: 'bg-danger-light dark:bg-danger-dark',
  info: 'bg-info-light dark:bg-info-dark',
  brand: 'bg-brand-100 dark:bg-brand-800',
};

const TEXT_TONES = {
  neutral: 'text-warm-700 dark:text-warm-200',
  success: 'text-success-dark dark:text-success-light',
  warning: 'text-warning-dark dark:text-warning-light',
  danger: 'text-danger-dark dark:text-danger-light',
  info: 'text-info-dark dark:text-info-light',
  brand: 'text-brand-700 dark:text-brand-100',
};

export function Badge({ tone = 'neutral', label, children, className }) {
  return (
    <View className={cn('self-start rounded-full px-2.5 py-1', TONES[tone], className)}>
      <Text variant="caption" className={cn('font-semibold', TEXT_TONES[tone])}>
        {label ?? children}
      </Text>
    </View>
  );
}

export default Badge;
