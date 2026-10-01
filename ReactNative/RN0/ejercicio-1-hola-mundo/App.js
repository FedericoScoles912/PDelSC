import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/Context/ThemeContext';
import TabNavigator from './src/Navigation/TabNavigator';

/** Punto de entrada: provee el tema compartido y la navegación. */
export default function App() {
  return <ThemeProvider><StatusBar style="auto" /><TabNavigator /></ThemeProvider>;
}
