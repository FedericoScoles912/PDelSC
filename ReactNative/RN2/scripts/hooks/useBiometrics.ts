import { useState, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { BiometricInfo } from '../types/sensors';
import { biometricService } from '../services/biometricService';
import { usePopup } from './usePopup';

export interface UseBiometricsResult {
  biometricInfo: BiometricInfo;
  isAuthenticating: boolean;
  refreshInfo: () => Promise<void>;
  authenticate: () => Promise<boolean>;
}

const initialBiometricInfo: BiometricInfo = {
  hasHardware: false,
  isEnrolled: false,
  supportedTypes: [],
  isSupportedOnPlatform: true,
};

/**
 * Hook para consultar hardware biométrico y ejecutar autenticaciones con pop-ups.
 */
export function useBiometrics(): UseBiometricsResult {
  const [biometricInfo, setBiometricInfo] = useState<BiometricInfo>(initialBiometricInfo);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const { showPopup } = usePopup();

  const refreshInfo = useCallback(async () => {
    const info = await biometricService.getBiometricCapabilities();
    setBiometricInfo(info);
  }, []);

  useEffect(() => {
    refreshInfo();
  }, [refreshInfo]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!biometricInfo.isSupportedOnPlatform) {
      showPopup({
        type: 'warning',
        title: 'Plataforma no compatible',
        message: 'La autenticación biométrica de hardware no está disponible en entorno Web.',
      });
      return false;
    }

    if (!biometricInfo.hasHardware) {
      showPopup({
        type: 'warning',
        title: 'Sensor no encontrado',
        message: 'Este dispositivo no cuenta con sensor biométrico (huella, reconocimiento facial o iris).',
      });
      return false;
    }

    if (!biometricInfo.isEnrolled) {
      showPopup({
        type: 'info',
        title: 'Sin datos biométricos',
        message: 'El dispositivo soporta biometría pero aún no tienes ninguna huella o rostro registrado.',
      });
      return false;
    }

    setIsAuthenticating(true);
    const result = await biometricService.authenticate();
    setIsAuthenticating(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showPopup({
        type: 'success',
        title: '¡Identidad verificada!',
        message: 'La autenticación biométrica fue exitosa y confirmada por el hardware del sistema.',
      });
      return true;
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      showPopup({
        type: 'error',
        title: 'Autenticación no completada',
        message: result.error || 'La lectura biométrica falló o fue cancelada por el usuario.',
      });
      return false;
    }
  }, [biometricInfo, showPopup]);

  return {
    biometricInfo,
    isAuthenticating,
    refreshInfo,
    authenticate,
  };
}
