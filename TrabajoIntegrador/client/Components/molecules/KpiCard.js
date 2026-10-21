/**
 * KpiCard.js
 * Tarjeta de indicador para el dashboard.
 */
import { View } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { cn } from '../../Utils/cn';

const TONES = {
  brand: 'bg-brand-100 dark:bg-brand-800',
  success: 'bg-success-light dark:bg-success-dark',
  warning: 'bg-warning-light dark:bg-warning-dark',
  danger: 'bg-danger-light dark:bg-danger-dark',
  info: 'bg-info-light dark:bg-info-dark',
};

export function KpiCard({ label, value, icon = 'info', tone = 'brand', hint, className }) {
  return (
    <Card className={cn('flex-1', className)}>
      <View className="flex-row items-center justify-between">
        <Text variant="caption" muted className="uppercase tracking-wide">{label}</Text>
        <View className={cn('h-8 w-8 items-center justify-center rounded-lg', TONES[tone])}>
          <Icon name={icon} size={16} className="text-warm-800 dark:text-warm-100" />
        </View>
      </View>
      <Text variant="h1" className="mt-2">{value}</Text>
      {hint ? <Text variant="caption" muted className="mt-1">{hint}</Text> : null}
    </Card>
  );
}

export default KpiCard;
