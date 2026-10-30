/**
 * @file Componentes menores: separador, chip, barra de progreso, casilla e
 *       interruptor.
 * @module client/src/componentes/ui/Basicos
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View, type ViewProps } from 'react-native';

import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';
import type { TonoInsignia } from './Insignia';

/** Separador horizontal u vertical. */
export function Separador({ vertical = false, clase }: { vertical?: boolean; clase?: string }) {
  return (
    <View className={cn(vertical ? 'h-full w-px' : 'h-px w-full', 'bg-borde', clase)} />
  );
}

/** Propiedades del chip. */
export interface ChipProps {
  /** Texto del chip. */
  texto: string;
  /** Indica si está seleccionado. */
  activo?: boolean;
  /** Icono a la izquierda. */
  icono?: keyof typeof Ionicons.glyphMap;
  /** Acción al presionar. */
  onPress?: () => void;
  /** Acción para quitar el chip. */
  onQuitar?: () => void;
  /** Clases adicionales. */
  clase?: string;
}

/** Etiqueta interactiva (filtros seleccionables). */
export function Chip({ texto, activo = false, icono, onPress, onQuitar, clase }: ChipProps) {
  const { tokens } = useTema();
  const color = activo ? (tokens.fondo === '#1A1512' ? tokens.fondo : '#FFFFFF') : tokens.textoSuave;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
        activo ? 'border-primario bg-primario' : 'border-borde bg-superficie-alt',
        clase
      )}
    >
      {icono && <Ionicons name={icono} size={14} color={color} />}
      <Text className={cn('text-sm font-semibold', activo ? 'text-white' : 'text-texto-suave')}>
        {texto}
      </Text>
      {onQuitar && (
        <Pressable accessibilityRole="button" onPress={onQuitar} className="ml-0.5">
          <Ionicons name="close-circle" size={15} color={color} />
        </Pressable>
      )}
    </Pressable>
  );
}

/** Propiedades de la barra de progreso. */
export interface BarraProps {
  /** Valor entre 0 y 1. */
  valor: number;
  /** Tono de color. */
  tono?: TonoInsignia;
  /** Clases adicionales. */
  clase?: string;
}

const FONDO_BARRA: Record<TonoInsignia, string> = {
  neutro: 'bg-texto-suave',
  primario: 'bg-primario',
  exito: 'bg-exito',
  advertencia: 'bg-advertencia',
  peligro: 'bg-peligro',
  info: 'bg-info'
};

/** Barra de progreso simple. */
export function Barra({ valor, tono = 'primario', clase }: BarraProps) {
  const porcentaje = Math.min(Math.max(valor, 0), 1) * 100;
  return (
    <View className={cn('h-2 w-full overflow-hidden rounded-full bg-superficie-alt', clase)}>
      <View className={cn('h-full rounded-full', FONDO_BARRA[tono])} style={{ width: `${porcentaje}%` }} />
    </View>
  );
}

/** Propiedades de la casilla de verificación. */
export interface CasillaProps {
  /** Texto de la casilla. */
  etiqueta: string;
  /** Estado marcado. */
  marcada: boolean;
  /** Cambio de estado. */
  onCambiar: (valor: boolean) => void;
  /** Deshabilita la interacción. */
  deshabilitada?: boolean;
  /** Clases adicionales. */
  clase?: string;
}

/** Casilla de verificación accesible. */
export function Casilla({ etiqueta, marcada, onCambiar, deshabilitada, clase }: CasillaProps) {
  const { tokens } = useTema();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcada, disabled: Boolean(deshabilitada) }}
      disabled={deshabilitada}
      onPress={() => onCambiar(!marcada)}
      className={cn('flex-row items-center gap-2.5 py-1', deshabilitada && 'opacity-50', clase)}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-md border',
          marcada ? 'border-primario bg-primario' : 'border-borde bg-superficie'
        )}
      >
        {marcada && <Ionicons name="checkmark" size={14} color={tokens.fondo === '#1A1512' ? tokens.fondo : '#FFFFFF'} />}
      </View>
      <Text className="flex-1 text-sm text-texto">{etiqueta}</Text>
    </Pressable>
  );
}

/** Propiedades del interruptor. */
export interface InterruptorProps {
  /** Estado del interruptor. */
  activo: boolean;
  /** Cambio de estado. */
  onCambiar: (valor: boolean) => void;
  /** Etiqueta accesible. */
  etiqueta?: string;
  /** Deshabilita la interacción. */
  deshabilitado?: boolean;
}

/** Interruptor de encendido/apagado. */
export function Interruptor({ activo, onCambiar, etiqueta, deshabilitado }: InterruptorProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={etiqueta}
      accessibilityState={{ checked: activo, disabled: Boolean(deshabilitado) }}
      disabled={deshabilitado}
      onPress={() => onCambiar(!activo)}
      className={cn(
        'h-6 w-11 justify-center rounded-full px-0.5',
        activo ? 'bg-primario' : 'bg-borde',
        deshabilitado && 'opacity-50'
      )}
    >
      <View
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow dark:bg-superficie',
          activo ? 'self-end' : 'self-start'
        )}
      />
    </Pressable>
  );
}

/** Propiedades de la fila de datos etiqueta/valor. */
export interface FilaDatoProps extends ViewProps {
  /** Etiqueta a la izquierda. */
  etiqueta: string;
  /** Valor a la derecha. */
  valor: string;
  /** Clases adicionales. */
  clase?: string;
}

/** Par etiqueta/valor alineado. */
export function FilaDato({ etiqueta, valor, clase, ...resto }: FilaDatoProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3 py-1.5', clase)} {...resto}>
      <Text className="text-sm text-texto-suave">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-texto">{valor}</Text>
    </View>
  );
}
