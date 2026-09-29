import { createContext, useCallback, useMemo, useRef, useState } from 'react';

export const NotificationContext = createContext(null);

let toastId = 0;

/**
 * NotificationProvider — Sistema propio de toasts SIN alert().
 * Tipos: 'info' | 'success' | 'error' | 'warning'
 * Consumir con useNotification() hook.
 */
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) { clearTimeout(t); timersRef.current.delete(id); }
  }, []);

  const push = useCallback((notification) => {
    const id = ++toastId;
    const toast = {
      id,
      type: 'info',
      duration: 4500,
      ...(typeof notification === 'string' ? { message: notification } : notification),
    };
    setToasts((prev) => [...prev, toast]);
    if (toast.duration > 0) {
      const timer = setTimeout(() => remove(id), toast.duration);
      timersRef.current.set(id, timer);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({
    toasts,
    notify: push,
    info: (msg, opts = {}) => push({ ...opts, type: 'info', message: msg }),
    success: (msg, opts = {}) => push({ ...opts, type: 'success', message: msg }),
    error: (msg, opts = {}) => push({ ...opts, type: 'error', message: msg }),
    warning: (msg, opts = {}) => push({ ...opts, type: 'warning', message: msg }),
    remove,
  }), [toasts, push, remove]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export default NotificationContext;
