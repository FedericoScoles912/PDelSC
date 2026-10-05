import { useContext } from 'react';
import { PopupContext, PopupContextType } from '../context/PopupContext';

/**
 * Hook para invocar y controlar el modal emergente de la aplicación.
 * Reemplaza de forma unificada y personalizada cualquier uso de alert().
 */
export function usePopup(): PopupContextType {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup debe ser utilizado dentro de un PopupProvider.');
  }
  return context;
}
