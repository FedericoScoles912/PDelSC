/**
 * @file Tarjeta / panel contenedor y encabezados de sección.
 * @module client/src/componentes/ui/Tarjeta
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';

/** Propiedades de la tarjeta. */
export interface TarjetaProps extends ViewProps {
  /** Clases adicionales. */
  clase?: string;
  /** Estilos adicionales. */
  style?: StyleProp<ViewStyle>;
  /** Reduce el padding interno. */
  compacta?: boolean;
}

/** Panel con fondo, borde y sombra suave. */
export function Tarjeta({ children, clase, style, compacta = false, ...resto }: TarjetaProps) {
  const { tokens } = useTema();
  return (
    <View
      style={[
        {
          shadowColor: tokens.sombra,
          shadowOpacity: 1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2
        },
        style
      ]}
      className={cn(
        'rounded-2xl border border-borde bg-superficie',
        compacta ? 'p-3' : 'p-5',
        clase
      )}
      {...resto}
    >
      {children}
    </View>
  );
}

/** Propiedades del encabezado de tarjeta. */
export interface EncabezadoTarjetaProps {
  /** Título principal. */
  titulo: string;
  /** Descripción secundaria. */
  descripcion?: string;
  /** Icono decorativo a la izquierda. */
  icono?: keyof typeof Ionicons.glyphMap;
  /** Acciones alineadas a la derecha. */
  acciones?: React.ReactNode;
  /** Callback al presionar el encabezado. */
  onPress?: () => void;
}

/** Encabezado estándar de una tarjeta o sección. */
export function EncabezadoTarjeta({
  titulo,
  descripcion,
  icono,
  acciones,
  onPress
}: EncabezadoTarjetaProps) {
  const { tokens } = useTema();
  const contenido = (
    <View className="mb-4 flex-row items-center justify-between gap-3">
      <View className="flex-1 flex-row items-center gap-3">
        {icono && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-superficie-alt">
            <Ionicons name={icono} size={20} color={tokens.primario} />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-texto">{titulo}</Text>
          {descripcion && <Text className="text-sm text-texto-suave">{descripcion}</Text>}
        </View>
      </View>
      {acciones && <View className="flex-row items-center gap-2">{acciones}</View>}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {contenido}
      </Pressable>
    );
  }
  return contenido;
}

/** Variante de tarjeta presionable. */
export function TarjetaPresionable({ children, clase, ...resto }: TarjetaProps) {
  return (
    <Tarjeta clase={cn('active:opacity-90', clase)} {...resto}>
      {children}
    </Tarjeta>
  );
}
