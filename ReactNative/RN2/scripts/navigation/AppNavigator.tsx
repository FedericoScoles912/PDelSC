import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTheme } from '../hooks/useTheme';
import { ScreenName } from '../types/navigation';
import DashboardScreen from '../screens/DashboardScreen';
import CameraScreen from '../screens/CameraScreen';
import ScannerScreen from '../screens/ScannerScreen';
import LocationScreen from '../screens/LocationScreen';
import MotionScreen from '../screens/MotionScreen';
import BiometricScreen from '../screens/BiometricScreen';
import ExtrasScreen from '../screens/ExtrasScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Sidebar } from '../components/organisms/Sidebar';
import { TabBar } from '../components/organisms/TabBar';
import { PopupModal } from '../components/feedback/PopupModal';

/**
 * Navegador principal adaptativo:
 * - Pantallas de escritorio (>= 992px, ej. 1920x1080): Barra lateral fija (Sidebar) y área principal expandida.
 * - Pantallas móviles y tablets (< 992px): Pantalla activa y barra de pestañas inferior (TabBar).
 */
export const AppNavigator: React.FC = () => {
  const { isDesktop } = useBreakpoint();
  const { theme } = useTheme();
  const [currentRoute, setCurrentRoute] = useState<ScreenName>('Dashboard');

  const renderCurrentScreen = () => {
    switch (currentRoute) {
      case 'Dashboard':
        return <DashboardScreen onNavigate={setCurrentRoute} />;
      case 'Camera':
        return <CameraScreen />;
      case 'Scanner':
        return <ScannerScreen />;
      case 'Location':
        return <LocationScreen />;
      case 'Motion':
        return <MotionScreen />;
      case 'Biometric':
        return <BiometricScreen />;
      case 'Extras':
        return <ExtrasScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.colors.background }]}>
      {isDesktop ? (
        // Modo escritorio: Barra lateral fija a la izquierda y pantalla extendida
        <View style={styles.desktopLayout}>
          <Sidebar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
          <View style={styles.desktopMainContent}>{renderCurrentScreen()}</View>
        </View>
      ) : (
        // Modo móvil/tablet: Pantalla superior y barra inferior de pestañas
        <View style={styles.mobileLayout}>
          <View style={styles.mobileMainContent}>{renderCurrentScreen()}</View>
          <TabBar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
        </View>
      )}

      {/* Modal global de pop-ups en lugar de alert() */}
      <PopupModal />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  desktopMainContent: {
    flex: 1,
    height: '100%',
  },
  mobileLayout: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  mobileMainContent: {
    flex: 1,
  },
});
