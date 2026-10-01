import { Pressable, Text } from 'react-native';
import { useTheme } from '../Context/ThemeContext';
/** Botón reutilizable que alterna entre tema claro y oscuro. */
export default function ThemeToggle({ buttonStyle, textStyle }) {
  const { mode, toggleTheme } = useTheme();
  return <Pressable accessibilityRole="button" onPress={toggleTheme} style={buttonStyle}><Text style={textStyle}>Usar tema {mode === 'light' ? 'oscuro' : 'claro'}</Text></Pressable>;
}
