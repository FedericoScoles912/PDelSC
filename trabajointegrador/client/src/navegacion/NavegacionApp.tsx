/**
 * @file Pila de módulos de la aplicación autenticada. Todo el contenido se
 *       dibuja dentro de {@link MarcoApp}, que mantiene la navegación fija.
 * @module client/src/navegacion/NavegacionApp
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EnConstruccion } from '../pantallas/EnConstruccion';
import { MarcoApp } from './MarcoApp';
import type { RutasApp } from './tipos';

const Pila = createNativeStackNavigator<RutasApp>();

/** Navegación entre los módulos internos del sistema. */
export function NavegacionApp() {
  return (
    <Pila.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false, animation: 'fade' }}
      layout={({ children, navigation, state }) => {
        const activa = state.routes[state.index]?.name ?? 'Dashboard';
        return (
          <MarcoApp activa={activa} onNavegar={(destino) => navigation.navigate(destino)}>
            {children}
          </MarcoApp>
        );
      }}
    >
      <Pila.Screen name="Dashboard" component={EnConstruccion} />
      <Pila.Screen name="Productos" component={EnConstruccion} />
      <Pila.Screen name="Stock" component={EnConstruccion} />
      <Pila.Screen name="Precios" component={EnConstruccion} />
      <Pila.Screen name="Categorias" component={EnConstruccion} />
      <Pila.Screen name="Reportes" component={EnConstruccion} />
      <Pila.Screen name="Importar" component={EnConstruccion} />
      <Pila.Screen name="Usuarios" component={EnConstruccion} />
      <Pila.Screen name="Auditoria" component={EnConstruccion} />
      <Pila.Screen name="Perfil" component={EnConstruccion} />
    </Pila.Navigator>
  );
}
