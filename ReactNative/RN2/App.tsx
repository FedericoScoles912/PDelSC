import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './scripts/context/ThemeContext';
import { PopupProvider } from './scripts/context/PopupContext';
import { AppNavigator } from './scripts/navigation/AppNavigator';

/**
 * Punto de entrada principal de Sensores Hub.
 * Inicializa proveedores de área segura, tema otoñal adaptativo y gestor de modales.
 */
export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PopupProvider>
          <AppNavigator />
        </PopupProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
