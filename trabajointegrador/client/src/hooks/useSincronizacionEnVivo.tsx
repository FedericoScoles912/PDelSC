/**
 * @file Hook para sincronizar datos en vivo y en el momento entre dispositivos
 *       (por ejemplo, cuando se modifica algo en el celular y debe reflejarse
 *       instantáneamente en la computadora, o viceversa).
 * @module client/src/hooks/useSincronizacionEnVivo
 */

import { useEffect, useRef } from 'react';

import { suscribirCambiosEnVivo } from '../servicios/api';

/**
 * Ejecuta `alCambiar` automáticamente cada vez que el backend reporta una
 * modificación realizada desde cualquier dispositivo conectado.
 * @param alCambiar Función de recarga silenciosa de la pantalla activa.
 */
export function useSincronizacionEnVivo(alCambiar: () => void): void {
  const callbackRef = useRef(alCambiar);
  callbackRef.current = alCambiar;

  useEffect(() => {
    const cancelar = suscribirCambiosEnVivo(() => {
      callbackRef.current();
    });
    return cancelar;
  }, []);
}
