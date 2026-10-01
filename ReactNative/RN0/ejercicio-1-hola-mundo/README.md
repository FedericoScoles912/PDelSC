# Ejercicio 1 — Hola Mundo con tabs

Instalación: `npm install` y luego `npx expo start`.

Se practica React Native con Expo, componentes reutilizables, estilos nativos, `Animated`, navegación inferior, adaptación con `useWindowDimensions` y tema con Context API.

## Dependencias justas

Expo aporta el entorno móvil. `@react-navigation/native` y `@react-navigation/bottom-tabs` resuelven exclusivamente las tabs; `react-native-screens` y `react-native-safe-area-context` son sus pares requeridos en Expo. No se usan Router, librerías de UI, iconos ni estilos externos: los íconos son glifos de texto y todo el estilo usa `StyleSheet`.

## Atomización

Las pantallas componen la vista; `TextoAnimado` tiene solo la animación, `ThemeToggle` solo el cambio de tema, navegación y contexto están aislados, y los estilos viven en módulos propios.
