/**
 * @file Store de Redux Toolkit y hooks tipados de acceso al estado.
 *
 * Al crearse enlaza el cliente HTTP con el slice de sesión: cuando el refresco
 * de tokens falla de forma definitiva el store marca la sesión como cerrada y
 * la navegación vuelve automáticamente a la pantalla de inicio de sesión.
 * @module client/src/estado/store
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import { registrarPerdidaSesion } from '../servicios/api';
import reductorSesion, { sesionPerdida } from './sesionSlice';

/** Store global de la aplicación. */
export const store = configureStore({
  reducer: {
    sesion: reductorSesion
  }
});

// El cliente HTTP avisa aquí cuando la sesión deja de ser válida.
registrarPerdidaSesion(() => {
  store.dispatch(sesionPerdida());
});

/** Tipo del estado raíz. */
export type EstadoRaiz = ReturnType<typeof store.getState>;

/** Tipo del `dispatch` del store. */
export type DespachoApp = typeof store.dispatch;

/** Hook de `dispatch` con tipado del store. */
export const useDespacho = (): DespachoApp => useDispatch<DespachoApp>();

/** Hook de selección con tipado del estado raíz. */
export const useSeleccionar: TypedUseSelectorHook<EstadoRaiz> = useSelector;
