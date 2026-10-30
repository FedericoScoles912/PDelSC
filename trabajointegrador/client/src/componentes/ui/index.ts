/**
 * @file Exportaciones del kit de interfaz propio.
 * @module client/src/componentes/ui
 */

export { Boton, BotonIcono, AccionesBotonera } from './Boton';
export type { BotonProps, VarianteBoton, TamanoBoton } from './Boton';

export { Entrada, AreaTexto } from './Entrada';
export type { EntradaProps } from './Entrada';

export { Tarjeta, TarjetaPresionable, EncabezadoTarjeta } from './Tarjeta';
export type { TarjetaProps } from './Tarjeta';

export { Insignia, tonoDeRol, tonoDeEstado, tonoDeStock } from './Insignia';
export type { InsigniaProps, TonoInsignia } from './Insignia';

export { Cargador, EstadoVacio, EstadoError } from './Estados';
export type { CargadorProps, EstadoVacioProps } from './Estados';

export {
  Separador,
  Chip,
  Barra,
  Casilla,
  Interruptor,
  FilaDato
} from './Basicos';
export type { ChipProps, BarraProps, CasillaProps, InterruptorProps } from './Basicos';

export { Selector } from './Selector';
export type { SelectorProps, OpcionSelector } from './Selector';
