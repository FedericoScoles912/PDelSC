/**
 * @file Raíz de la aplicación. Encadena los proveedores globales (estado,
 *       tema, gestos, área segura y pop-ups) y monta la navegación.
 * @module client/App
 */

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
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
  const { esOscuro, claseRaiz, tokens, estiloVariables } = useTema();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: tokens.fondo }}>
      <View
        className={claseRaiz}
        style={[{ flex: 1, backgroundColor: tokens.fondo }, estiloVariables]}
      >
        <StatusBar style={esOscuro ? 'light' : 'dark'} />
        <SafeAreaProvider>
          <PopUpsProvider>
            <NavegacionRaiz />
          </PopUpsProvider>
        </SafeAreaProvider>
      </View>
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
