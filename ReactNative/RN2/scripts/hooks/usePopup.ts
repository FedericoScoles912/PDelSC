import { useContext } from 'react';
import { PopupContext, PopupContextValue } from '../context/PopupContext';

/**
 * Hook para invocar y controlar ventanas modales de pop-up globales en reemplazo de alert().
 */
export function usePopup(): PopupContextValue {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup debe ser utilizado dentro de un PopupProvider');
  }
  return context;
}
