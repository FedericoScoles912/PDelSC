/**
 * @file Pila de módulos de la aplicación autenticada. Todo el contenido se
 *       dibuja dentro de {@link MarcoApp}, que mantiene la navegación fija.
 * @module client/src/navegacion/NavegacionApp
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Auditoria } from '../pantallas/Auditoria';
import { Categorias } from '../pantallas/Categorias';
import { Dashboard } from '../pantallas/Dashboard';
import { Deposito } from '../pantallas/Deposito';
import { Importar } from '../pantallas/Importar';
import { Perfil } from '../pantallas/Perfil';
import { Precios } from '../pantallas/Precios';
import { Productos } from '../pantallas/Productos';
import { Reportes } from '../pantallas/Reportes';
import { Stock } from '../pantallas/Stock';
import { Usuarios } from '../pantallas/Usuarios';
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
      <Pila.Screen name="Dashboard" component={Dashboard} />
      <Pila.Screen name="Productos" component={Productos} />
      <Pila.Screen name="Deposito" component={Deposito} />
      <Pila.Screen name="Stock" component={Stock} />
      <Pila.Screen name="Precios" component={Precios} />
      <Pila.Screen name="Categorias" component={Categorias} />
      <Pila.Screen name="Reportes" component={Reportes} />
      <Pila.Screen name="Importar" component={Importar} />
      <Pila.Screen name="Usuarios" component={Usuarios} />
      <Pila.Screen name="Auditoria" component={Auditoria} />
      <Pila.Screen name="Perfil" component={Perfil} />
    </Pila.Navigator>
  );
}
