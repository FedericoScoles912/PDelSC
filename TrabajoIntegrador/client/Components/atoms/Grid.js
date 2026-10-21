/**
 * Grid.js
 * Grilla de 12 columnas con API estilo Bootstrap (Container / Row / Col) construida
 * sobre NativeWind (Tailwind) para funcionar igual en Android y en Web.
 *
 * Nota: Bootstrap es un framework CSS de DOM y NO aplica dentro de React Native.
 * Por eso aquí se replica su CONTRATO (contenedor fluido + grilla de 12 columnas +
 * breakpoints sm/md/lg/xl/xxl) mediante componentes, evitando conflictos de estilos
 * con Tailwind.
 *
 * Regla de uso (para evitar choques de estilos):
 *   - Layout de grilla (filas/columnas/spans)  -> Container / Row / Col.
 *   - Detalles visuales (color, tipografía, spacing interno) -> clases Tailwind `className`.
 *   - No usar `w-1/2`, `flex-row` ni `gap-*` para armar grillas: usar Row/Col.
 */
import { createContext, useContext } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { cn } from '../../Utils/cn';
import { breakpointFor } from '../../Utils/responsive';

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
const CONTAINER_MAX = { xs: '100%', sm: 540, md: 720, lg: 960, xl: 1140, xxl: 1320 };

/** Gutter (separación entre columnas, en px) compartido entre Row y sus Col. */
const GutterContext = createContext(12);

/**
 * Contenedor: centra el contenido y aplica un ancho máximo por breakpoint.
 * @param {{fluid?:boolean, className?:string, children?:any}} props
 */
export function Container({ fluid = false, className, children, ...rest }) {
  const { width } = useWindowDimensions();
  const maxWidth = fluid ? '100%' : CONTAINER_MAX[breakpointFor(width)];
  return (
    <View className={cn('mx-auto w-full px-3', className)} style={{ maxWidth }} {...rest}>
      {children}
    </View>
  );
}

/**
 * Fila de la grilla. Distribuye sus Col y define el gutter.
 * @param {{gutter?:number, className?:string, style?:object, children?:any}} props
 */
export function Row({ gutter, className, children, style, ...rest }) {
  const parentGutter = useContext(GutterContext);
  const g = gutter ?? parentGutter;
  return (
    <GutterContext.Provider value={g}>
      <View
        className={cn('flex-row flex-wrap', className)}
        style={[{ marginHorizontal: -g / 2 }, style]}
        {...rest}
      >
        {children}
      </View>
    </GutterContext.Provider>
  );
}

/**
 * Columna de la grilla. Los spans se expresan en columnas de 12 y son responsive:
 * `xs` aplica desde 0px; `md` desde el breakpoint md en adelante; etc.
 * @param {{xs?:number, sm?:number, md?:number, lg?:number, xl?:number, xxl?:number,
 *          className?:string, style?:object, children?:any}} props
 */
export function Col({ xs, sm, md, lg, xl, xxl, className, children, style, ...rest }) {
  const gutter = useContext(GutterContext);
  const { width } = useWindowDimensions();

  const spans = { xs, sm, md, lg, xl, xxl };
  const currentIndex = BREAKPOINTS.indexOf(breakpointFor(width));

  // Toma el último span definido para un breakpoint <= al actual (herencia tipo Bootstrap).
  let span = null;
  for (let i = 0; i <= currentIndex; i += 1) {
    const value = spans[BREAKPOINTS[i]];
    if (value != null) span = value;
  }
  if (span == null) span = 12;

  const safeSpan = Math.min(Math.max(span, 0), 12);
  const width_ = `${(safeSpan / 12) * 100}%`;

  return (
    <View
      className={cn(className)}
      style={[{ width: width_, paddingHorizontal: gutter / 2 }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

export default { Container, Row, Col };
