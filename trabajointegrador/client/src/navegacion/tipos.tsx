/**
 * @file Tipos de las pilas de navegación.
 * @module client/src/navegacion/tipos
 */

/** Rutas de la pila raíz (carga → inicio de sesión → aplicación). */
export type RutasRaiz = {
  /** Verificación inicial de la sesión persistida. */
  Carga: undefined;
  /** Pantalla de inicio de sesión. */
  InicioSesion: undefined;
  /** Aplicación autenticada. */
  App: undefined;
};

/** Módulos de la aplicación autenticada. */
export type RutasApp = {
  /** Panel de indicadores. */
  Dashboard: undefined;
  /** Catálogo de productos. */
  Productos: undefined;
  /** Stock físico en depósito (Admin y Encargado de depósito). */
  Deposito: undefined;
  /** Movimientos de stock. */
  Stock: undefined;
  /** Listas de precios e historial. */
  Precios: undefined;
  /** Categorías de productos. */
  Categorias: undefined;
  /** Usuarios y roles. */
  Usuarios: undefined;
  /** Registro de auditoría. */
  Auditoria: undefined;
  /** Reportes y exportaciones. */
  Reportes: undefined;
  /** Importación desde Excel. */
  Importar: undefined;
  /** Datos de la cuenta propia. */
  Perfil: undefined;
};
