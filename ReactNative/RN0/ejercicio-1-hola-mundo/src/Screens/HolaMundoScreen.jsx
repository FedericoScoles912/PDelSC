import { SafeAreaView, Text, View, useWindowDimensions } from 'react-native';
import TextoAnimado from '../Components/TextoAnimado';
import ThemeToggle from '../Components/ThemeToggle';
import { useTheme } from '../Context/ThemeContext';
import { createHolaStyles } from '../Styles/HolaMundoStyles';
/** Pantalla centrada que demuestra texto, sombra y animación nativa. */
export default function HolaMundoScreen() {
  const { colors } = useTheme(); const { width } = useWindowDimensions(); const styles = createHolaStyles(colors, width < 360);
  return <SafeAreaView style={styles.safe}><View style={styles.container}><TextoAnimado style={styles.title}>¡Hola, mundo!</TextoAnimado><Text style={styles.subtitle}>Una bienvenida simple con color, tipografía y movimiento.</Text><ThemeToggle buttonStyle={styles.themeButton} textStyle={styles.themeText} /></View></SafeAreaView>;
}
