/**
 * @file Pantalla provisional de módulo. Se registra como componente de cada
 *       ruta de la pila principal y deduce su contenido de la definición del
 *       menú, de modo que cada módulo queda rotulado correctamente hasta que
 *       se implemente su interfaz definitiva.
 * @module client/src/pantallas/EnConstruccion
 */

import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ScrollView, Text, View } from 'react-native';

import { Tarjeta } from '../componentes/ui/Tarjeta';
import { itemDeRuta } from '../navegacion/menu';
import type { RutasApp } from '../navegacion/tipos';
import { useTema } from '../tema/TemaProvider';

/** Encabezado y aviso de módulo pendiente de implementación. */
export function EnConstruccion() {
  const { tokens } = useTema();
  const ruta = useRoute<RouteProp<RutasApp, keyof RutasApp>>();
  const item = itemDeRuta(ruta.name);

  return (
    <ScrollView
      className="flex-1 bg-fondo"
      contentContainerClassName="gap-5 p-5"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
          <Ionicons name={item?.icono ?? 'construct-outline'} size={24} color={tokens.primario} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-xl font-bold text-texto">{item?.titulo ?? ruta.name}</Text>
          <Text className="text-sm text-texto-suave">
            {item?.descripcion ?? 'Módulo del sistema.'}
          </Text>
        </View>
      </View>

      <Tarjeta clase="items-center gap-3 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-superficie-alt">
          <Ionicons name="hammer-outline" size={26} color={tokens.textoSuave} />
        </View>
        <Text className="text-base font-bold text-texto">Módulo en construcción</Text>
        <Text className="max-w-lg text-center text-sm text-texto-suave">
          La estructura de navegación, el estado global y el acceso por roles ya están activos.
          La interfaz definitiva de este módulo se incorpora en la etapa de implementación
          funcional.
        </Text>
      </Tarjeta>
    </ScrollView>
  );
}
