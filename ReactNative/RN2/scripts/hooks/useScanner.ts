import { useState, useEffect, useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScanHistoryItem } from '../types/history';
import { storageService } from '../services/storageService';
import { clipboardService } from '../services/clipboardService';
import { isValidUrl, sanitizeUrl } from '../utils/validators';
import { usePopup } from './usePopup';

export interface UseScannerState {
  isScanning: boolean;
  history: ScanHistoryItem[];
  lastScanned: ScanHistoryItem | null;
  handleBarcodeScanned: (result: { data: string; type: string }) => Promise<void>;
  resumeScanning: () => void;
  pauseScanning: () => void;
  clearHistory: () => Promise<void>;
}

/**
 * Hook para escaneo de códigos de barra y QR con debounce, feedback háptico y persistencia.
 */
export function useScanner(): UseScannerState {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [lastScanned, setLastScanned] = useState<ScanHistoryItem | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedDataRef = useRef<string>('');
  const { showPopup } = usePopup();

  const loadHistory = useCallback(async () => {
    const items = await storageService.getScanHistory();
    setHistory(items);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const resumeScanning = useCallback(() => {
    setIsScanning(true);
  }, []);

  const pauseScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const clearHistory = useCallback(async () => {
    await storageService.clearScanHistory();
    setHistory([]);
    showPopup({
      type: 'info',
      title: 'Historial vaciado',
      message: 'Se han eliminado todos los registros de códigos escaneados.',
    });
  }, [showPopup]);

  const handleBarcodeScanned = useCallback(
    async ({ data, type }: { data: string; type: string }) => {
      const now = Date.now();
      // Debounce de 2.5 segundos para evitar múltiples disparos consecutivos del mismo código
      if (!isScanning) return;
      if (data === lastScannedDataRef.current && now - lastScanTimeRef.current < 2500) {
        return;
      }

      lastScanTimeRef.current = now;
      lastScannedDataRef.current = data;
      setIsScanning(false);

      // Respuesta háptica de éxito
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      const isUrl = isValidUrl(data);
      const newItem: ScanHistoryItem = {
        id: `${now}-${Math.random().toString(36).substring(2, 7)}`,
        data,
        type: type || 'QR / Código',
        scannedAt: new Date().toISOString(),
        isUrl,
      };

      setLastScanned(newItem);
      const updated = await storageService.addScanHistoryItem(newItem);
      setHistory(updated);

      const actions = [
        {
          label: 'Copiar',
          variant: 'secondary' as const,
          onPress: async () => {
            await clipboardService.copyText(data);
            showPopup({
              type: 'success',
              title: 'Copiado',
              message: 'El contenido fue copiado al portapapeles.',
              actions: [
                {
                  label: 'Escanear otro',
                  variant: 'primary',
                  onPress: () => resumeScanning(),
                },
              ],
            });
          },
        },
      ];

      if (isUrl) {
        actions.push({
          label: 'Abrir enlace',
          variant: 'primary' as const,
          onPress: async () => {
            const finalUrl = sanitizeUrl(data);
            try {
              const supported = await Linking.canOpenURL(finalUrl);
              if (supported) {
                await Linking.openURL(finalUrl);
              } else {
                showPopup({
                  type: 'error',
                  title: 'Enlace no soportado',
                  message: `No fue posible abrir la dirección web: ${finalUrl}`,
                });
              }
            } catch {
              showPopup({
                type: 'error',
                title: 'Error al abrir',
                message: 'Ocurrió un error al intentar abrir el navegador.',
              });
            }
          },
        });
      }

      actions.push({
        label: 'Escanear otro',
        variant: isUrl ? ('outline' as const) : ('primary' as const),
        onPress: () => {
          resumeScanning();
        },
      });

      showPopup({
        type: 'success',
        title: 'Código Detectado',
        message: `Tipo: ${newItem.type}\n\n${data}`,
        actions,
        dismissible: true,
      });
    },
    [isScanning, resumeScanning, showPopup]
  );

  return {
    isScanning,
    history,
    lastScanned,
    handleBarcodeScanned,
    resumeScanning,
    pauseScanning,
    clearHistory,
  };
}
