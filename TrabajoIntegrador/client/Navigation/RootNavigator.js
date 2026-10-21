/**
 * RootNavigator.js
 * Decide qué pila mostrar según el estado de autenticación y muestra una
 * pantalla de carga mientras se restaura la sesión.
 */
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Spinner } from '../Components/atoms/Spinner';
import { Text } from '../Components/atoms/Text';

export function RootNavigator() {
  const { status, inicializado } = useSelector((s) => s.auth);

  if (!inicializado || status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-warm-50 dark:bg-warm-950">
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
          <Text className="text-2xl font-bold text-white">R</Text>
        </View>
        <Spinner size="large" />
        <Text muted className="mt-3">Restaurando sesión…</Text>
      </View>
    );
  }

  return status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />;
}

export default RootNavigator;
