/**
 * @file Pantalla de carga inicial. Se muestra mientras se verifica la sesión
 *       persistida, antes de decidir entre el inicio de sesión y la aplicación.
 * @module client/src/pantallas/CargaInicial
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

import { useTema } from '../tema/TemaProvider';

/** Verificación inicial de la sesión guardada. */
export function CargaInicial() {
  const { tokens } = useTema();

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-fondo px-6">
      <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primario">
        <Ionicons name="aperture-outline" size={42} color={tokens.sobrePrimario} />
      </View>
      <View className="items-center gap-1">
        <Text className="text-xl font-bold text-texto">Stocker</Text>
        <Text className="text-sm text-texto-suave">Sistema de control de stock</Text>
      </View>
      <ActivityIndicator size="small" color={tokens.primario} />
      <Text className="text-sm text-texto-suave">Verificando sesión…</Text>
    </View>
  );
}
