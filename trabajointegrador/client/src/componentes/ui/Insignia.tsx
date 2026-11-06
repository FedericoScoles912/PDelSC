/**
 * @file Insignia (badge) para estados, roles y categorías. Incluye helpers
 *       para mapear estados de negocio a colores.
 * @module client/src/componentes/ui/Insignia
 */

import { Text, View } from 'react-native';

import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';
import type { Esquema } from '../../tema/tokens';

/** Colores semánticos admitidos por la insignia. */
export type TonoInsignia = 'neutro' | 'primario' | 'exito' | 'advertencia' | 'peligro' | 'info';

const FONDO: Record<TonoInsignia, string> = {
  neutro: 'bg-superficie-alt',
  primario: 'bg-primario/15',
  exito: 'bg-exito/15',
  advertencia: 'bg-advertencia/20',
  peligro: 'bg-peligro/15',
  info: 'bg-info/15'
};

const TEXTO: Record<TonoInsignia, string> = {
  neutro: 'text-texto-suave',
  primario: 'text-primario',
  exito: 'text-exito',
  advertencia: 'text-advertencia',
  peligro: 'text-peligro',
  info: 'text-info'
};

/** Propiedades de la insignia. */
export interface InsigniaProps {
  /** Texto a mostrar. */
  texto: string;
  /** Tono de color. */
  tono?: TonoInsignia;
  /** Icono opcional. */
  icono?: React.ReactNode;
  /** Clases adicionales. */
  clase?: string;
}

/** Etiqueta compacta de estado. */
export function Insignia({ texto, tono = 'neutro', icono, clase }: InsigniaProps) {
  const { tokens } = useTema();
  const colorBase =
    tono === 'primario'
      ? tokens.primario
      : tono === 'exito'
        ? tokens.exito
        : tono === 'advertencia'
          ? tokens.advertencia
          : tono === 'peligro'
            ? tokens.peligro
            : tono === 'info'
              ? tokens.info
              : tokens.textoSuave;
  const fondoBase = tono === 'neutro' ? tokens.superficieAlt : `${colorBase}26`;

  return (
    <View
      style={{ backgroundColor: fondoBase }}
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        FONDO[tono],
        clase
      )}
    >
      {icono}
      <Text style={{ color: colorBase }} className={cn('text-xs font-bold', TEXTO[tono])}>
        {texto}
      </Text>
    </View>
  );
}

/** Devuelve el tono sugerido para el código de rol del sistema. */
export function tonoDeRol(codigo: string | undefined): TonoInsignia {
  switch ((codigo ?? '').toLowerCase()) {
    case 'admin':
    case 'administrador':
      return 'primario';
    case 'deposito':
    case 'encargado':
      return 'info';
    case 'vendedor':
    case 'consulta':
      return 'exito';
    default:
      return 'neutro';
  }
}

/** Devuelve el tono sugerido según el estado activo/inactivo. */
export function tonoDeEstado(activo: boolean | number | undefined): TonoInsignia {
  return Number(activo ?? 0) === 1 ? 'exito' : 'neutro';
}

/** Devuelve el tono sugerido para el nivel de stock. */
export function tonoDeStock(stock: number, minimo: number, _esquema?: Esquema): TonoInsignia {
  if (stock <= 0) return 'peligro';
  if (minimo > 0 && stock <= minimo) return 'advertencia';
  return 'exito';
}
