/**
 * @file Tipos de dominio compartidos por el estado global, los servicios y las
 *       pantallas. Reflejan exactamente el contrato público del backend.
 * @module client/src/estado/tipos
 */

/** Códigos de rol del sistema (coinciden con la tabla `roles`). */
export type CodigoRol = 'admin' | 'deposito' | 'vendedor';

/** Rol asignado a un usuario. */
export interface Rol {
  /** Código interno (`admin`, `deposito`, `vendedor`). */
  codigo: string;
  /** Nombre legible del rol. */
  nombre: string;
}

/** Usuario público devuelto por la API (sin datos sensibles). */
export interface Usuario {
  /** Identificador interno. */
  id: number;
  /** Correo electrónico. */
  email: string;
  /** Nombre. */
  nombre: string;
  /** Apellido. */
  apellido: string | null;
  /** Teléfono de contacto. */
  telefono: string | null;
  /** Indica si la cuenta está habilitada. */
  activo: boolean;
  /** Indica si el email fue verificado. */
  emailVerificado: boolean;
  /** Fecha del último inicio de sesión. */
  ultimoLoginEn: string | null;
  /** Fecha de alta del usuario. */
  creadoEn: string;
  /** Rol asignado. */
  rol: Rol;
}

/** Respuesta de los endpoints de inicio de sesión. */
export interface SesionIniciada {
  /** Usuario autenticado. */
  usuario: Usuario;
  /** Token de acceso (vida corta). */
  accessToken: string;
  /** Token de refresco (vida larga). */
  refreshToken: string;
}

/** Estados posibles de la sesión dentro de la aplicación. */
export type EstadoSesion = 'inicial' | 'anonimo' | 'autenticado';
