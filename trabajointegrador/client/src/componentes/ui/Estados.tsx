/**
 * @file Indicadores de carga y estados vacíos / de error.
 * @module client/src/componentes/ui/Estados
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

import { Boton } from './Boton';
import { useTema } from '../../tema/TemaProvider';

/** Propiedades del indicador de carga. */
export interface CargadorProps {
  /** Mensaje bajo el indicador. */
  mensaje?: string;
  /** Ocupa toda la altura disponible. */
  pantallaCompleta?: boolean;
}

/** Indicador de carga centrado. */
export function Cargador({ mensaje, pantallaCompleta = false }: CargadorProps) {
  const { tokens } = useTema();
  return (
    <View
      className={`items-center justify-center gap-3 py-8 ${pantallaCompleta ? 'flex-1' : ''}`}
    >
      <ActivityIndicator size="large" color={tokens.primario} />
      {mensaje && <Text className="text-sm text-texto-suave">{mensaje}</Text>}
    </View>
  );
}

/** Propiedades del estado vacío. */
export interface EstadoVacioProps {
  /** Título principal. */
  titulo: string;
  /** Descripción secundaria. */
  descripcion?: string;
  /** Icono a mostrar. */
  icono?: keyof typeof Ionicons.glyphMap;
  /** Color del icono. */
  tono?: 'neutro' | 'peligro';
  /** Texto del botón de acción. */
  textoAccion?: string;
  /** Acción del botón. */
  onAccion?: () => void;
}

/** Mensaje para listas sin resultados. */
export function EstadoVacio({
  titulo,
  descripcion,
  icono = 'file-tray-outline',
  tono = 'neutro',
  textoAccion,
  onAccion
}: EstadoVacioProps) {
  const { tokens } = useTema();
  return (
    <View className="items-center justify-center gap-2 py-12">
      <View className="mb-1 h-16 w-16 items-center justify-center rounded-full bg-superficie-alt">
        <Ionicons
          name={icono}
          size={30}
          color={tono === 'peligro' ? tokens.peligro : tokens.textoSuave}
        />
      </View>
      <Text className="text-base font-bold text-texto">{titulo}</Text>
      {descripcion && (
        <Text className="max-w-md text-center text-sm text-texto-suave">{descripcion}</Text>
      )}
      {textoAccion && onAccion && (
        <View className="mt-3">
          <Boton titulo={textoAccion} onPress={onAccion} tamano="sm" variante="contorno" />
        </View>
      )}
    </View>
  );
}

/** Propiedades del estado de error. */
export interface EstadoErrorProps {
  /** Mensaje de error visible. */
  mensaje: string;
  /** Reintenta la operación. */
  onReintentar?: () => void;
}

/** Estado de error con opción de reintento. */
export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <EstadoVacio
      titulo="Ocurrió un problema"
      descripcion={mensaje}
      icono="alert-circle-outline"
      tono="peligro"
      textoAccion={onReintentar ? 'Reintentar' : undefined}
      onAccion={onReintentar}
    />
  );
}
