import { SafeAreaView, Text, View, useWindowDimensions } from 'react-native';
import ThemeToggle from '../Components/ThemeToggle';
import { useTheme } from '../Context/ThemeContext';
import { createSecondStyles } from '../Styles/SegundoTabStyles';
/** Tab alternativo con un layout editorial basado en tarjetas. */
export default function SegundoTabScreen() {
  const { colors } = useTheme(); const { width } = useWindowDimensions(); const styles = createSecondStyles(colors, width >= 600);
  return <SafeAreaView style={styles.safe}><View style={styles.content}><View style={styles.header}><Text style={styles.eyebrow}>SEGUNDO TAB</Text><Text style={styles.title}>Un rincón tranquilo.</Text></View><View style={styles.cards}><View style={styles.card}><Text style={styles.cardTitle}>Diseño distinto</Text><Text style={styles.cardText}>Esta pantalla usa una composición asimétrica y verde oliva.</Text></View><View style={styles.card}><Text style={styles.cardTitle}>Responsive</Text><Text style={styles.cardText}>En tablet, las tarjetas se organizan en una fila.</Text></View></View><ThemeToggle buttonStyle={styles.toggle} textStyle={styles.toggleText} /></View></SafeAreaView>;
}
