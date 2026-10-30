/**
 * @file Botón unificado del sistema. Reemplaza los botones nativos y las
 *       clases de Bootstrap por variantes alineadas a la paleta otoñal.
 * @module client/src/componentes/ui/Boton
 */

import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';

import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';

/** Variantes visuales disponibles. */
export type VarianteBoton = 'primario' | 'secundario' | 'contorno' | 'texto' | 'peligro' | 'exito';

/** Tamaños disponibles. */
export type TamanoBoton = 'sm' | 'md' | 'lg';

/** Propiedades del botón. */
export interface BotonProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  /** Texto visible. */
  titulo: string;
  /** Variante visual. */
  variante?: VarianteBoton;
  /** Tamaño. */
  tamano?: TamanoBoton;
  /** Icono a la izquierda. */
  icono?: keyof typeof Ionicons.glyphMap;
  /** Icono a la derecha. */
  iconoDerecha?: keyof typeof Ionicons.glyphMap;
  /** Muestra un indicador de carga y deshabilita el botón. */
  cargando?: boolean;
  /** Deshabilita el botón. */
  deshabilitado?: boolean;
  /** Ocupa el ancho disponible. */
  anchoCompleto?: boolean;
  /** Estilos adicionales del contenedor. */
  style?: StyleProp<ViewStyle>;
  /** Clases adicionales. */
  clase?: string;
}

const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  primario: 'bg-primario border border-primario',
  secundario: 'bg-superficie-alt border border-borde',
  contorno: 'bg-transparent border border-primario',
  texto: 'bg-transparent border border-transparent',
  peligro: 'bg-peligro border border-peligro',
  exito: 'bg-exito border border-exito'
};

const CLASES_TEXTO: Record<VarianteBoton, string> = {
  primario: 'text-white dark:text-fondo',
  secundario: 'text-texto',
  contorno: 'text-primario',
  texto: 'text-primario',
  peligro: 'text-white dark:text-fondo',
  exito: 'text-white dark:text-fondo'
};

const CLASES_TAMANO: Record<TamanoBoton, string> = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-4 py-2.5 rounded-xl',
  lg: 'px-6 py-3.5 rounded-xl'
};

const CLASES_TEXTO_TAMANO: Record<TamanoBoton, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const TAMANO_ICONO: Record<TamanoBoton, number> = { sm: 15, md: 18, lg: 21 };

/**
 * Botón con variantes, iconos y estado de carga.
 */
export function Boton({
  titulo,
  variante = 'primario',
  tamano = 'md',
  icono,
  iconoDerecha,
  cargando = false,
  anchoCompleto = false,
  deshabilitado,
  style,
  clase,
  onPress,
  ...resto
}: BotonProps) {
  const { tokens, esquema } = useTema();
  const inactivo = Boolean(deshabilitado) || cargando;

  const colorTexto =
    variante === 'primario' || variante === 'peligro' || variante === 'exito'
      ? esquema === 'oscuro'
        ? tokens.fondo
        : '#FFFFFF'
      : variante === 'secundario'
        ? tokens.texto
        : tokens.primario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={onPress}
      style={style}
      className={cn(
        'flex-row items-center justify-center gap-2',
        CLASES_VARIANTE[variante],
        CLASES_TAMANO[tamano],
        anchoCompleto && 'w-full',
        inactivo && 'opacity-50',
        clase
      )}
      {...resto}
    >
      {cargando ? (
        <ActivityIndicator size="small" color={colorTexto} />
      ) : (
        icono && <Ionicons name={icono} size={TAMANO_ICONO[tamano]} color={colorTexto} />
      )}
      <Text
        numberOfLines={1}
        className={cn('font-semibold', CLASES_TEXTO[variante], CLASES_TEXTO_TAMANO[tamano])}
      >
        {titulo}
      </Text>
      {iconoDerecha && !cargando && (
        <Ionicons name={iconoDerecha} size={TAMANO_ICONO[tamano]} color={colorTexto} />
      )}
    </Pressable>
  );
}

/** Botón cuadrado sólo-icono (barra superior, acciones de tabla). */
export interface BotonIconoProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Icono a mostrar. */
  icono: keyof typeof Ionicons.glyphMap;
  /** Tamaño del icono en px. */
  tamano?: number;
  /** Color explícito (por defecto, texto del tema). */
  color?: string;
  /** Estilos adicionales. */
  style?: StyleProp<ViewStyle>;
  /** Clases adicionales. */
  clase?: string;
}

/** Botón compacto con un único icono. */
export function BotonIcono({ icono, tamano = 20, color, style, clase, ...resto }: BotonIconoProps) {
  const { tokens } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      style={style}
      className={cn('items-center justify-center rounded-lg p-2 active:bg-superficie-alt', clase)}
      {...resto}
    >
      <Ionicons name={icono} size={tamano} color={color ?? tokens.texto} />
    </Pressable>
  );
}

/** Contenedor de fila de acciones de tabla / tarjeta. */
export function AccionesBotonera({ children }: { children: React.ReactNode }) {
  return <View className="flex-row items-center gap-2">{children}</View>;
}
