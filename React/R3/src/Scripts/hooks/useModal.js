import { useState, useCallback } from 'react';

/**
 * Custom hook para controlar modales de alerta y confirmación sin usar alert()/confirm()
 */
export function useModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info' | 'success' | 'warning' | 'error'
    onConfirm: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
  });

  const showModal = useCallback(({
    title,
    message,
    type = 'info',
    onConfirm = null,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    showCancel = false,
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((message, title = 'Operación Exitosa') => {
    showModal({ title, message, type: 'success' });
  }, [showModal]);

  const showError = useCallback((message, title = 'Atención / Error') => {
    showModal({ title, message, type: 'error' });
  }, [showModal]);

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
  };
}
