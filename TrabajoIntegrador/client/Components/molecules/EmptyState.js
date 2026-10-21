/**
 * EmptyState.js
 * Estado vacío para listas/tablas sin datos.
 */
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Spinner } from '../atoms/Spinner';

export function EmptyState({ icon = 'info', title = 'Sin resultados', message, loading = false, className }) {
  if (loading) return <Spinner className={className} size="large" />;
  return (
    <View className={`items-center justify-center px-6 py-12 ${className || ''}`}>
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-warm-100 dark:bg-warm-800">
        <Icon name={icon} size={22} className="text-warm-500" />
      </View>
      <Text variant="h3">{title}</Text>
      {message ? <Text muted className="mt-1 text-center">{message}</Text> : null}
    </View>
  );
}

export default EmptyState;
