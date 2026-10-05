# Sistema de Temas Otoñales y Guía de Personalización

El sistema de estilos utiliza una paleta cromática inspirada en los tonos relajados del otoño, prescindiendo deliberadamente de blancos `#FFFFFF` o negros `#000000` puros para el fondo o el texto, reduciendo la fatiga visual y garantizando un contraste accesible de nivel **WCAG AA**.

---

## 1. Paletas de Colores Implementadas

### 1.1. Modo Claro (Crema y Terracota)

| Token | Código HEX | Rol y Justificación Visual |
| :--- | :---: | :--- |
| `background` | `#F5EBDD` | Fondo crema otoñal cálido y envolvente. |
| `surface` | `#FBF4E9` | Superficie de tarjetas y paneles para generar elevación. |
| `surfaceVariant` | `#EFE2D1` | Superficie secundaria para campos y estados hover. |
| `text` | `#4A3426` | Marrón café oscuro que provee alto contraste AA sobre fondo crema. |
| `textSecondary` | `#6B4F3B` | Marrón medio para subtítulos y etiquetas descriptivas. |
| `textMuted` | `#8C7260` | Marrón suave para placeholders e información de ayuda. |
| `primary` | `#B5651D` | Terracota vivo para botones primarios y acentos principales. |
| `primaryHover` | `#9E5616` | Terracota oscuro para estado activo/hover. |
| `secondary` | `#D9A441` | Ocre dorado para insignias secundarias y destacados. |
| `accent` | `#7A8450` | Verde oliva para indicadores de estado y confirmaciones. |
| `border` | `#E3D2BC` | Borde sutil y natural para tarjetas e inputs. |
| `borderFocus` | `#B5651D` | Borde activo terracota en foco de entrada. |
| `error` | `#BA3B28` | Rojo ladrillo otoñal para validaciones y modales de error. |

---

### 1.2. Modo Oscuro (Marrón Café y Ámbar)

| Token | Código HEX | Rol y Justificación Visual |
| :--- | :---: | :--- |
| `background` | `#2B211B` | Marrón café profundo, sin llegar al negro artificial. |
| `surface` | `#3A2D25` | Superficie marrón cálida para contenedores y modales. |
| `surfaceVariant` | `#46372E` | Superficie de tarjetas secundarias y badges. |
| `text` | `#EADBC8` | Crema claro de alta legibilidad sobre fondos oscuros. |
| `textSecondary` | `#D1BEA8` | Crema suave para textos de soporte. |
| `textMuted` | `#A6927E` | Crema apagado para marcas de agua y placeholders. |
| `primary` | `#D98E3F` | Ámbar brillante con excelente visibilidad y dinamismo. |
| `primaryHover` | `#E59F54` | Ámbar luminoso para pulsaciones y foco. |
| `secondary` | `#B86B3C` | Cobre metálico para elementos secundarios. |
| `accent` | `#8E9A5B` | Verde musgo para indicadores y estados satisfactorios. |
| `border` | `#52413A` | Borde de delimitación suave que no satura la vista. |
| `borderFocus` | `#D98E3F` | Borde ámbar en foco de elementos interactivos. |
| `error` | `#E06B52` | Coral suave para evitar agresividad visual en modo noche. |

---

## 2. Cómo Agregar un Tema Nuevo

Para extender el sistema con un nuevo tema (por ejemplo, `nordic` o `forest`):

1. **Definir la nueva paleta en `/styles/theme.ts`:**
   ```typescript
   export const forestTheme: ColorPalette = {
     background: '#1F2A24',
     surface: '#28362E',
     surfaceVariant: '#34473C',
     text: '#DDE8E0',
     textSecondary: '#B2C4B7',
     textMuted: '#849689',
     primary: '#4E8752',
     primaryHover: '#3D6D41',
     secondary: '#A6804E',
     accent: '#6E9C85',
     border: '#3E5446',
     borderFocus: '#4E8752',
     error: '#D95D50',
     errorBackground: '#4A2824',
     success: '#5FB368',
     successBackground: '#264229',
     info: '#5D8FA8',
     infoBackground: '#223842',
     inputBg: '#243229',
     shadow: 'rgba(0, 0, 0, 0.4)',
   };
   ```

2. **Actualizar el tipo `ThemeMode`:**
   ```typescript
   export type ThemeMode = 'light' | 'dark' | 'forest';
   ```

3. **Registrarlo en `ThemeContext.tsx`:**
   En la función `currentTheme`, asociar el nuevo caso:
   ```typescript
   const currentTheme: ColorPalette = 
     mode === 'light' ? lightTheme :
     mode === 'dark' ? darkTheme : forestTheme;
   ```

4. **Incorporarlo a `tailwind.config.js`:**
   Agregar la nueva variante de color dentro de `theme.extend.colors` si se desea utilizar mediante clases utilitarias de Tailwind.
