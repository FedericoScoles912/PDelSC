import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HolaMundoScreen from '../Screens/HolaMundoScreen';
import SegundoTabScreen from '../Screens/SegundoTabScreen';
import { useTheme } from '../Context/ThemeContext';
const Tab = createBottomTabNavigator();
/** Define la única navegación de la aplicación: dos pestañas inferiores. */
export default function TabNavigator() { const { colors } = useTheme(); return <NavigationContainer theme={{ dark: false, colors: { primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, notification: colors.primary } }}><Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>{route.name === 'Hola' ? '☀' : '▣'}</Text> })}><Tab.Screen name="Hola" component={HolaMundoScreen} options={{ tabBarLabel: 'Hola' }} /><Tab.Screen name="Explorar" component={SegundoTabScreen} options={{ tabBarLabel: 'Explorar' }} /></Tab.Navigator></NavigationContainer>; }
