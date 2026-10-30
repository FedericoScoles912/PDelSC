/**
 * @file Raíz de la aplicación. Encadena los proveedores globales (estado,
 *       tema, gestos, área segura y pop-ups) y monta la navegación.
 * @module client/App
 */

import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';
import { PopUpsProvider } from './src/componentes/popups/PopUpsProvider';
import { store } from './src/estado/store';
import { NavegacionRaiz } from './src/navegacion/NavegacionRaiz';
import { TemaProvider, useTema } from './src/tema/TemaProvider';

/** Contenido interno, ya dentro del contexto de tema. */
function Contenido() {
  const { esOscuro, claseRaiz } = useTema();
  return (
    <GestureHandlerRootView className={claseRaiz}>
      <StatusBar style={esOscuro ? 'light' : 'dark'} />
      <SafeAreaProvider>
        <PopUpsProvider>
          <NavegacionRaiz />
        </PopUpsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Componente raíz. */
export default function App() {
  return (
    <Provider store={store}>
      <TemaProvider>
        <Contenido />
      </TemaProvider>
    </Provider>
  );
}
