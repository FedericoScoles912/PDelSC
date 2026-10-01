import { StatusBar } from 'expo-status-bar';
import CatalogoScreen from './src/Screens/CatalogoScreen';
import { ThemeProvider } from './src/Context/ThemeContext';

/** Punto de entrada del catálogo de una única pantalla. */
export default function App(): React.JSX.Element { return <ThemeProvider><StatusBar style="auto" /><CatalogoScreen /></ThemeProvider>; }
