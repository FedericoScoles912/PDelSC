import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { BatteryInfo, NetworkInfo, DeviceInfoState } from '../types/sensors';
import { clipboardService } from '../services/clipboardService';
import { usePopup } from './usePopup';

export interface UseDeviceInfoResult {
  battery: BatteryInfo;
  network: NetworkInfo;
  device: DeviceInfoState;
  clipboardContent: string;
  refreshDeviceInfo: () => Promise<void>;
  testHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => Promise<void>;
  testClipboard: (text: string) => Promise<void>;
  refreshClipboard: () => Promise<void>;
}

const initialBattery: BatteryInfo = {
  batteryLevel: null,
  batteryState: 'Desconocido',
  isLowPowerMode: null,
  isSupported: true,
};

const initialNetwork: NetworkInfo = {
  isConnected: null,
  isInternetReachable: null,
  networkType: 'Desconocido',
};

const initialDevice: DeviceInfoState = {
  brand: Device.brand || 'Genérico',
  manufacturer: Device.manufacturer || 'Desconocido',
  modelName: Device.modelName || 'Dispositivo ' + Platform.OS,
  osName: Device.osName || Platform.OS,
  osVersion: Device.osVersion || 'N/A',
  deviceType: Device.deviceType ? String(Device.deviceType) : 'Móvil',
  isDevice: Device.isDevice,
};

/**
 * Hook para monitorear estado de batería, red, detalles del hardware y pruebas interactivas.
 */
export function useDeviceInfo(): UseDeviceInfoResult {
  const [battery, setBattery] = useState<BatteryInfo>(initialBattery);
  const [network, setNetwork] = useState<NetworkInfo>(initialNetwork);
  const [device] = useState<DeviceInfoState>(initialDevice);
  const [clipboardContent, setClipboardContent] = useState<string>('');
  const { showPopup } = usePopup();

  const getBatteryStateName = (state: Battery.BatteryState): string => {
    switch (state) {
      case Battery.BatteryState.CHARGING:
        return 'Cargando';
      case Battery.BatteryState.FULL:
        return 'Completa (100%)';
      case Battery.BatteryState.UNPLUGGED:
        return 'Descargando (Batería)';
      default:
        return 'Desconocido';
    }
  };

  const getNetworkTypeName = (type: Network.NetworkStateType): string => {
    switch (type) {
      case Network.NetworkStateType.WIFI:
        return 'Wi-Fi';
      case Network.NetworkStateType.CELLULAR:
        return 'Red Móvil (4G/5G)';
      case Network.NetworkStateType.ETHERNET:
        return 'Ethernet Cableado';
      case Network.NetworkStateType.NONE:
        return 'Sin Conexión';
      default:
        return 'Desconocido';
    }
  };

  const refreshBattery = useCallback(async () => {
    if (Platform.OS === 'web') {
      setBattery({
        batteryLevel: 1.0,
        batteryState: 'Alimentación CA (Web)',
        isLowPowerMode: false,
        isSupported: false,
      });
      return;
    }

    try {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      const isLowPower = await Battery.isLowPowerModeEnabledAsync();

      setBattery({
        batteryLevel: level >= 0 ? level : null,
        batteryState: getBatteryStateName(state),
        isLowPowerMode: isLowPower,
        isSupported: true,
      });
    } catch {
      setBattery({
        batteryLevel: null,
        batteryState: 'No disponible',
        isLowPowerMode: null,
        isSupported: false,
      });
    }
  }, []);

  const refreshNetwork = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setNetwork({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        networkType: getNetworkTypeName(state.type),
      });
    } catch {
      setNetwork({
        isConnected: null,
        isInternetReachable: null,
        networkType: 'Error de consulta',
      });
    }
  }, []);

  const refreshClipboard = useCallback(async () => {
    const text = await clipboardService.getClipboardText();
    setClipboardContent(text);
  }, []);

  const refreshDeviceInfo = useCallback(async () => {
    await Promise.all([refreshBattery(), refreshNetwork(), refreshClipboard()]);
  }, [refreshBattery, refreshNetwork, refreshClipboard]);

  const testHaptic = useCallback(
    async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
      if (Platform.OS === 'web') {
        showPopup({
          type: 'info',
          title: 'Vibración simulada',
          message: `El motor de respuesta háptica (${type}) no está disponible en la web.`,
        });
        return;
      }

      try {
        switch (type) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch {
        showPopup({
          type: 'error',
          title: 'Error de vibración',
          message: 'No fue posible accionar el motor de vibración del dispositivo.',
        });
      }
    },
    [showPopup]
  );

  const testClipboard = useCallback(
    async (text: string) => {
      const ok = await clipboardService.copyText(text);
      if (ok) {
        await refreshClipboard();
        showPopup({
          type: 'success',
          title: 'Copiado al portapapeles',
          message: `Texto guardado exitosamente:\n"${text}"`,
        });
      } else {
        showPopup({
          type: 'error',
          title: 'Fallo al copiar',
          message: 'No se pudo acceder al portapapeles del sistema.',
        });
      }
    },
    [refreshClipboard, showPopup]
  );

  useEffect(() => {
    refreshDeviceInfo();
  }, [refreshDeviceInfo]);

  return {
    battery,
    network,
    device,
    clipboardContent,
    refreshDeviceInfo,
    testHaptic,
    testClipboard,
    refreshClipboard,
  };
}
