/**
 * App.js
 * Raíz de la aplicación: providers (Redux, SafeArea, Tema, Feedback),
 * navegación y restauración de la sesión persistente.
 */
import './global.css';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './Store';
import { useAppDispatch } from './Store/hooks';
import { bootstrap } from './Store/slices/authSlice';
import { ThemeProvider, useTheme } from './Styles/ThemeProvider';
import { FeedbackProvider } from './Components/organisms/FeedbackProvider';
import { RootNavigator } from './Navigation';

function AppInner() {
  const dispatch = useAppDispatch();
  const { scheme, tokens } = useTheme();

  // Restaura la sesión guardada (valida token / refresca si expiró).
  useEffect(() => {
    dispatch(bootstrap());
  }, [dispatch]);

  const navTheme = {
    ...DefaultTheme,
    dark: scheme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: tokens.primary,
      background: tokens.background,
      card: tokens.surface,
      text: tokens.text,
      border: tokens.border,
      notification: tokens.primary,
    },
  };

  return (
    <FeedbackProvider>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style={tokens.statusBar} />
    </FeedbackProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppInner />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
