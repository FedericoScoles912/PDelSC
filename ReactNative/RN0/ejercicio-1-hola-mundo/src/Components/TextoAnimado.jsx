import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
/**
 * Muestra texto con una entrada suave.
 * @param {{children: import('react').ReactNode, style?: object}} props Contenido y estilo del texto.
 */
export default function TextoAnimado({ children, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => { Animated.parallel([Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.spring(translateY, { toValue: 0, useNativeDriver: true })]).start(); }, [opacity, translateY]);
  return <Animated.Text style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.Text>;
}
