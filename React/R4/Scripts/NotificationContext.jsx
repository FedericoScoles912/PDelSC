// ============================================================
// Scripts/NotificationContext.jsx
// Contexto para gestionar notificaciones tipo toast.
// Proporciona notify() para agregar y removeToast() para quitar.
// Incluye NotificationProvider que renderiza NotificationModal
// y el hook useNotification para consumir el contexto.
// ============================================================
import { createContext, useContext, useState, useCallback } from 'react';
import { NotificationModal } from '../Components/NotificationModal.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Genera un id único simple para cada toast
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  };

  // Agrega una nueva notificación y la remueve automáticamente
  const notify = useCallback((type, message, timeout = 4500) => {
    const id = generateId();
    const newToast = { id, type, message };

    setToasts((prev) => [...prev, newToast]);

    if (timeout > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, timeout);
    }

    return id;
  }, []);

  // Remueve una notificación específica por su id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, removeToast }}>
      {children}
      <NotificationModal toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
}

export { NotificationContext };
