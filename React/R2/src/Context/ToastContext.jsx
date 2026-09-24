import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Provider que maneja los mensajes toast/notificaciones globales.
 * Evita el uso de alert() en todo el proyecto.
 * @component
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  /**
   * Muestra un toast con los datos proporcionados.
   * @param {Object} params
   * @param {string} params.mensaje - Texto a mostrar
   * @param {'exito'|'error'|'info'} [params.tipo='info'] - Tipo de toast
   * @param {number} [params.duracion=3000] - Duración en ms
   */
  const mostrarToast = useCallback(({ mensaje, tipo = 'info', duracion = 3000 }) => {
    const id = Date.now();
    setToast({ id, mensaje, tipo });
    setTimeout(() => {
      setToast((actual) => (actual && actual.id === id ? null : actual));
    }, duracion);
  }, []);

  /**
   * Oculta el toast actual.
   */
  const ocultarToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ toast, mostrarToast, ocultarToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de toast.
 * @returns {{ toast: Object|null, mostrarToast: Function, ocultarToast: Function }}
 */
export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return contexto;
}

export default ToastContext;
