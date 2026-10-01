# Ejercicio 2 — Catálogo de componentes nativos

Instalación: `npm install` y después `npx expo start`.

Se practica TypeScript en React Native, componentes atómicos, `ScrollView`, `FlatList`, controles interactivos, modal controlado por estado, diseño responsive y Context API para tema claro/oscuro.

## Dependencias justas

Expo, React y React Native cubren el entorno y todos los componentes enseñados. TypeScript y los tipos de React se usan solo en desarrollo. No hay navegación porque hay una única pantalla, ni librerías externas de UI, iconos o estilos.

## Atomización

`CatalogoScreen` solo compone y ordena las secciones. Cada componente nativo tiene su propio archivo y estado local cuando lo requiere. `SectionCard` concentra la presentación compartida, `ThemeContext` gestiona el tema, y las interfaces y estilos tipados se mantienen separados.
