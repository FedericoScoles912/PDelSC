import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { PopupState, ShowPopupParams } from '../types';

export interface PopupContextType {
  popup: PopupState;
  showPopup: (params: ShowPopupParams) => void;
  hidePopup: () => void;
}

const defaultPopupState: PopupState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  buttonText: 'Aceptar',
};

export const PopupContext = createContext<PopupContextType | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [popup, setPopup] = useState<PopupState>(defaultPopupState);

  const showPopup = useCallback(({ type, title, message, buttonText = 'Aceptar', onClose }: ShowPopupParams) => {
    setPopup({
      visible: true,
      type,
      title,
      message,
      buttonText,
      onClose,
    });
  }, []);

  const hidePopup = useCallback(() => {
    if (popup.onClose) {
      popup.onClose();
    }
    setPopup((prev) => ({ ...prev, visible: false }));
  }, [popup]);

  return (
    <PopupContext.Provider value={{ popup, showPopup, hidePopup }}>
      {children}
    </PopupContext.Provider>
  );
};
