import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext.jsx';

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification debe usarse dentro de <NotificationProvider>');
  return ctx;
}
export default useNotification;
