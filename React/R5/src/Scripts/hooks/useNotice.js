import { useContext } from 'react';

import { NoticeContext } from '../context/NoticeContext.jsx';

/**
 * Acceso a las notificaciones/confirmaciones propias (sin alert/confirm nativos).
 *
 *   const { notify, confirm } = useNotice();
 *   notify({ type: 'error', message: 'Algo salió mal' });
 *   if (await confirm({ message: '¿Desvincular esta cuenta?' })) { ... }
 */
export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice debe usarse dentro de <NoticeProvider>.');
  }
  return context;
}
