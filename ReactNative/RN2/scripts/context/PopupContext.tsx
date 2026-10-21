import React, { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { PopupOptions, PopupState } from '../types/popup';

export interface PopupContextValue {
  popupState: PopupState;
  showPopup: (options: PopupOptions) => void;
  hidePopup: () => void;
}

export const PopupContext = createContext<PopupContextValue | undefined>(undefined);

interface PopupProviderProps {
  children: ReactNode;
}

const initialPopupState: PopupState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  actions: [],
  dismissible: true,
};

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [popupState, setPopupState] = useState<PopupState>(initialPopupState);

  const showPopup = useCallback((options: PopupOptions) => {
    setPopupState({
      visible: true,
      type: options.type,
      title: options.title,
      message: options.message,
      actions: options.actions ?? [{ label: 'Aceptar', variant: 'primary' }],
      dismissible: options.dismissible ?? true,
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopupState((prev) => ({ ...prev, visible: false }));
  }, []);

  const value = useMemo(
    () => ({
      popupState,
      showPopup,
      hidePopup,
    }),
    [popupState, showPopup, hidePopup]
  );

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>;
};
