import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './scripts/context/ThemeContext';
import { PopupProvider } from './scripts/context/PopupContext';
import { AppNavigator } from './scripts/navigation/AppNavigator';
import { PopupModal } from './scripts/components/feedback/PopupModal';
import { useTheme } from './scripts/hooks/useTheme';
import './styles/global.css';

/**
 * Contenedor interno para sincronizar la StatusBar de Expo con el tema activo
 */
const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <AppNavigator />
      {/* Modal global de pop-up accesible desde cualquier componente mediante usePopup() */}
      <PopupModal />
    </>
  );
};

/**
 * Punto de entrada principal de la aplicación frontend
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PopupProvider>
          <AppContent />
        </PopupProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
