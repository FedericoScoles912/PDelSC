/**
 * FeedbackProvider.js
 * Sistema de avisos propio de la app. PROHIBIDO usar alert()/Alert.alert.
 *
 * Expone:
 *   const { toast, dialog } = useFeedback();
 *   toast({ message, tone });                       // aviso efímero
 *   await dialog({ title, message, tone, ... });    // confirmación -> boolean
 *   await dialog({ message, alertOnly: true });      // aviso que requiere OK
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { ModalPopup } from '../molecules/ModalPopup';
import { cn } from '../../Utils/cn';

const FeedbackContext = createContext(null);

const TONE_STYLES = {
  success: { box: 'bg-success border-success-dark', icon: 'check' },
  error: { box: 'bg-danger border-danger-dark', icon: 'alert' },
  warning: { box: 'bg-warning border-warning-dark', icon: 'alert' },
  info: { box: 'bg-info border-info-dark', icon: 'info' },
};

function Toast({ item, onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.info;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => onDone());
    }, item.duration ?? 2800);
    return () => clearTimeout(t);
  }, [opacity, item, onDone]);

  return (
    <Animated.View style={{ opacity }} className="mb-2 w-full">
      <View className={cn('flex-row items-center gap-2 rounded-xl border px-3 py-2.5', tone.box)}>
        <Icon name={tone.icon} size={16} className="text-white" />
        <Text className="flex-1 text-white" variant="label">{item.message}</Text>
      </View>
    </Animated.View>
  );
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialogState, setDialogState] = useState(null);
  const resolver = useRef(null);

  const toast = useCallback((opts) => {
    const item = typeof opts === 'string' ? { message: opts, tone: 'info' } : opts;
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...item }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dialog = useCallback((opts) => {
    const cfg = typeof opts === 'string' ? { message: opts } : opts;
    setDialogState({ tone: 'info', ...cfg });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const closeDialog = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialogState(null);
  }, []);

  const value = useMemo(() => ({ toast, dialog }), [toast, dialog]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* Capa de toasts */}
      <View pointerEvents="box-none" className="absolute left-0 right-0 top-4 z-50 items-center px-4">
        <View className="w-full max-w-md">
          {toasts.map((t) => (
            <Toast key={t.id} item={t} onDone={() => removeToast(t.id)} />
          ))}
        </View>
      </View>

      <ModalPopup
        visible={!!dialogState}
        onClose={() => closeDialog(false)}
        title={dialogState?.title}
        maxWidth={440}
        footer={
          dialogState?.alertOnly ? (
            <Button label="Entendido" onPress={() => closeDialog(true)} />
          ) : (
            <>
              <Button variant="secondary" label={dialogState?.cancelLabel || 'Cancelar'} onPress={() => closeDialog(false)} />
              <Button
                variant={dialogState?.tone === 'error' ? 'danger' : 'primary'}
                label={dialogState?.confirmLabel || 'Confirmar'}
                onPress={() => closeDialog(true)}
              />
            </>
          )
        }
      >
        <Text muted>{dialogState?.message}</Text>
      </ModalPopup>
    </FeedbackContext.Provider>
  );
}

/** @returns {{toast:(o:any)=>void, dialog:(o:any)=>Promise<boolean>}} */
export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>');
  return ctx;
}

export default FeedbackProvider;
