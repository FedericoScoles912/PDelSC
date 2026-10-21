# Sistema de Diseño y Paletas Otoñales

Este documento describe la filosofía visual de **Sensores Hub**, las paletas cálidas y relajadas implementadas para evitar contrastes agresivos (sin blancos o negros puros), y la guía paso a paso para extender o incorporar un nuevo tema.

---

## 1. Paletas de Color Implementadas

Ambos esquemas cumplen con los estándares de accesibilidad **WCAG AA** de ratio de contraste:

### 1.1. Modo Claro (Inspiración Crema y Arcilla)
- **Fondo:** `#F5EBDD` (Crema cálido)
- **Superficie:** `#FBF4E9` (Crema suave para tarjetas y paneles)
- **Superficie Hover/Active:** `#EFE3D3`
- **Texto Principal:** `#4A3426` (Marrón café profundo)
- **Texto Secundario:** `#7A6658` (Marrón suave atenuado)
- **Primario:** `#B5651D` (Terracota tradicional)
- **Secundario:** `#D9A441` (Ocre dorado)
- **Acento:** `#7A8450` (Verde oliva)
- **Bordes:** `#E3D2BC` (Tierra clara)
- **Error:** `#A8442F` (Ladrillo tostado)

### 1.2. Modo Oscuro (Inspiración Café Tostado y Ámbar)
- **Fondo:** `#2B211B` (Marrón café noche)
- **Superficie:** `#3A2D25` (Marrón chocolate medio para tarjetas)
- **Superficie Hover/Active:** `#4A3B32`
- **Texto Principal:** `#EADBC8` (Arena clara)
- **Texto Secundario:** `#BBA896` (Beige atenuado)
- **Primario:** `#D98E3F` (Ámbar brillante)
- **Secundario:** `#B86B3C` (Cobre encendido)
- **Acento:** `#8E9A5B` (Verde musgo cálido)
- **Bordes:** `#52413A` (Borde sutil)
- **Error:** `#D0694F` (Terracota vivo)

---

## 2. Definición Central (`/styles/theme.ts`)

Todos los colores, espaciados, bordes y tipografías se concentran en `/styles/theme.ts`. Ningún componente debe declarar colores en hexadecimal directamente en sus estilos.

```typescript
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  border: string;
  borderLight: string;
  error: string;
  errorBackground: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  info: string;
  infoBackground: string;
}
```

---

## 3. Guía: Cómo Agregar un Tema Nuevo

Para agregar un tercer tema (por ejemplo, un tema de alto contraste o tema Forestal):

1. **Definir el nuevo objeto de colores en `/styles/theme.ts`:**
```typescript
export const forestColors: ThemeColors = {
  background: '#1A291E',
  surface: '#233829',
  surfaceHover: '#2E4835',
  surfaceMuted: '#1E3224',
  text: '#E3EDE6',
  textSecondary: '#A2BBA8',
  primary: '#529667',
  primaryLight: '#6CB081',
  secondary: '#C49A45',
  accent: '#7FA86D',
  border: '#354E3C',
  borderLight: '#425F4B',
  error: '#D0694F',
  errorBackground: '#442621',
  success: '#7FA86D',
  successBackground: '#263821',
  warning: '#E2A94C',
  warningBackground: '#42331C',
  info: '#689DBA',
  infoBackground: '#1E323E',
};
```

2. **Actualizar el tipo `ThemeMode` en `/scripts/types/theme.ts`:**
```typescript
export type ThemeMode = 'light' | 'dark' | 'system' | 'forest';
```

3. **Modificar el cálculo de tema en `/scripts/context/ThemeContext.tsx`:**
```typescript
const theme: AppTheme = useMemo(() => {
  let colors = lightColors;
  if (mode === 'forest') colors = forestColors;
  else if (isDark) colors = darkColors;

  return {
    isDark: mode === 'forest' || isDark,
    colors,
    spacing,
    borderRadius,
    typography,
    breakpoints,
  };
}, [mode, isDark]);
```

4. **Incorporar la opción en `ThemeToggle.tsx`:**
Agrega el nuevo elemento a la lista `modes` con su etiqueta e icono correspondiente.
