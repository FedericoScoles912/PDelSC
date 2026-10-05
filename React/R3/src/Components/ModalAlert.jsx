import React, { useEffect } from 'react';
import Button from './Button.jsx';

/**
 * Componente Modal propio para alertas, notificaciones y confirmaciones.
 * Reemplaza de forma elegante cualquier uso de window.alert, window.confirm o prompt.
 */
export default function ModalAlert({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false,
}) {
  // Manejo de tecla Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      color: 'text-autumn-olive dark:text-autumn-olive-light',
      bgIcon: 'bg-autumn-olive/10 dark:bg-autumn-olive/20',
      buttonVariant: 'olive',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      color: 'text-red-600 dark:text-red-400',
      bgIcon: 'bg-red-100 dark:bg-red-950/40',
      buttonVariant: 'danger',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      color: 'text-autumn-mustard-dark dark:text-autumn-mustard-light',
      bgIcon: 'bg-autumn-mustard/15 dark:bg-autumn-mustard/20',
      buttonVariant: 'secondary',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      color: 'text-autumn-terracotta dark:text-autumn-terracotta-light',
      bgIcon: 'bg-autumn-terracotta/10 dark:bg-autumn-terracotta/20',
      buttonVariant: 'primary',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const currentType = typeConfig[type] || typeConfig.info;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      {/* Overlay click para cerrar */}
      <div className="fixed inset-0 transition-opacity" onClick={onClose} aria-hidden="true" />

      {/* Caja modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-autumn-darkbg-card border border-autumn-beige-300 dark:border-autumn-darkbg-border rounded-2xl shadow-2xl p-6 sm:p-8 transform transition-all text-center z-10">
        <div className={`mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full ${currentType.bgIcon} ${currentType.color}`}>
          {currentType.icon}
        </div>

        {title && (
          <h3 className="text-xl font-bold text-autumn-warmbrown dark:text-autumn-darktext-primary mb-2">
            {title}
          </h3>
        )}

        <div className="text-sm text-autumn-warmbrown-light dark:text-autumn-darktext-secondary mb-6 leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-center gap-3">
          {showCancel && (
            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              {cancelText}
            </Button>
          )}
          <Button variant={currentType.buttonVariant} onClick={handleConfirm} className="w-full sm:w-auto min-w-[100px]">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
