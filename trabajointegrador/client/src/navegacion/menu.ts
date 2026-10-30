/**
 * @file Definición del menú de navegación y su filtrado por rol.
 *
 * Es la única fuente de verdad sobre qué módulos existen, con qué título e
 * icono se muestran y qué roles pueden verlos. La barra lateral, la barra
 * superior móvil y las pantallas leen de aquí.
 * @module client/src/navegacion/menu
 */

import type { CodigoRol } from '../estado/tipos';
import type { NombreIcono } from '../utils/iconos';
import type { RutasApp } from './tipos';

/** Sección visual a la que pertenece un ítem del menú. */
export type GrupoMenu = 'Operación' | 'Gestión' | 'Sistema' | 'Cuenta';

/** Orden en el que se dibujan las secciones del menú. */
export const ORDEN_GRUPOS: readonly GrupoMenu[] = ['Operación', 'Gestión', 'Sistema', 'Cuenta'];

/** Todos los roles del sistema. */
const TODOS: CodigoRol[] = ['admin', 'deposito', 'vendedor'];

/** Ítem del menú de navegación. */
export interface ItemMenu {
  /** Ruta del módulo. */
  ruta: keyof RutasApp;
  /** Título visible. */
  titulo: string;
  /** Descripción breve del módulo. */
  descripcion: string;
  /** Icono representativo. */
  icono: NombreIcono;
  /** Sección a la que pertenece. */
  grupo: GrupoMenu;
  /** Roles que pueden acceder al módulo. */
  roles: CodigoRol[];
}

/** Módulos de la aplicación. */
export const MENU: readonly ItemMenu[] = [
  {
    ruta: 'Dashboard',
    titulo: 'Panel',
    descripcion: 'Indicadores generales de stock, alertas y actividad reciente.',
    icono: 'speedometer-outline',
    grupo: 'Operación',
    roles: TODOS
  },
  {
    ruta: 'Productos',
    titulo: 'Productos',
    descripcion: 'Catálogo de retenes y sellos, con búsqueda por eje, alojamiento y altura.',
    icono: 'pricetags-outline',
    grupo: 'Operación',
    roles: TODOS
  },
  {
    ruta: 'Stock',
    titulo: 'Movimientos',
    descripcion: 'Entradas, salidas y ajustes de stock con trazabilidad.',
    icono: 'cube-outline',
    grupo: 'Operación',
    roles: ['admin', 'deposito']
  },
  {
    ruta: 'Precios',
    titulo: 'Precios',
    descripcion: 'Listas de precios vigentes e historial de cambios.',
    icono: 'cash-outline',
    grupo: 'Operación',
    roles: TODOS
  },
  {
    ruta: 'Categorias',
    titulo: 'Categorías',
    descripcion: 'Familias y subcategorías del catálogo.',
    icono: 'grid-outline',
    grupo: 'Gestión',
    roles: ['admin', 'deposito']
  },
  {
    ruta: 'Reportes',
    titulo: 'Reportes',
    descripcion: 'Exportación de informes de stock, precios y movimientos.',
    icono: 'document-text-outline',
    grupo: 'Gestión',
    roles: TODOS
  },
  {
    ruta: 'Importar',
    titulo: 'Importar Excel',
    descripcion: 'Carga masiva del listado de precios y actualización del catálogo.',
    icono: 'cloud-upload-outline',
    grupo: 'Gestión',
    roles: ['admin']
  },
  {
    ruta: 'Usuarios',
    titulo: 'Usuarios',
    descripcion: 'Altas, roles y estado de las cuentas del sistema.',
    icono: 'people-outline',
    grupo: 'Sistema',
    roles: ['admin']
  },
  {
    ruta: 'Auditoria',
    titulo: 'Auditoría',
    descripcion: 'Registro de acciones realizadas sobre el sistema.',
    icono: 'shield-checkmark-outline',
    grupo: 'Sistema',
    roles: ['admin']
  },
  {
    ruta: 'Perfil',
    titulo: 'Mi cuenta',
    descripcion: 'Datos personales, contraseña y preferencias.',
    icono: 'person-circle-outline',
    grupo: 'Cuenta',
    roles: TODOS
  }
];

/**
 * Devuelve los ítems del menú visibles para un rol.
 * @param codigoRol Código del rol (`admin`, `deposito`, `vendedor`).
 */
export function itemsPermitidos(codigoRol: string | undefined): ItemMenu[] {
  if (!codigoRol) return [];
  return MENU.filter((item) => (item.roles as string[]).includes(codigoRol));
}

/**
 * Busca la definición de un módulo por su ruta.
 * @param ruta Nombre de la ruta.
 */
export function itemDeRuta(ruta: string): ItemMenu | undefined {
  return MENU.find((item) => item.ruta === ruta);
}
