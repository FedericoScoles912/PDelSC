import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import { Camera } from 'expo-camera';
import { PermissionType, PermissionStatusName, PermissionState } from '../types/permissions';
import { usePopup } from './usePopup';

/**
 * Hook reutilizable para gestionar y consultar permisos de hardware de forma reactiva.
 */
export function usePermission(type: PermissionType): PermissionState & {
  requestPermission: () => Promise<boolean>;
  openAppSettings: () => Promise<void>;
  checkPermission: () => Promise<PermissionStatusName>;
} {
  const [status, setStatus] = useState<PermissionStatusName>('undetermined');
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showPopup } = usePopup();

  const checkPermission = useCallback(async (): Promise<PermissionStatusName> => {
    setIsLoading(true);

    try {
      if (type === 'biometrics') {
        if (Platform.OS === 'web') {
          setStatus('unsupported');
          setIsLoading(false);
          return 'unsupported';
        }
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          setStatus('denied');
          setCanAskAgain(false);
          setIsLoading(false);
          return 'denied';
        }

        setStatus('granted');
        setCanAskAgain(true);
        setIsLoading(false);
        return 'granted';
      }

      if (type === 'camera') {
        const result = await Camera.getCameraPermissionsAsync();
        const stateName: PermissionStatusName = result.granted
          ? 'granted'
          : result.canAskAgain
          ? 'undetermined'
          : 'denied';

        setStatus(stateName);
        setCanAskAgain(result.canAskAgain);
        setIsLoading(false);
        return stateName;
      }

      if (type === 'location') {
        const result = await Location.getForegroundPermissionsAsync();
        const stateName: PermissionStatusName = result.granted
          ? 'granted'
          : result.canAskAgain
          ? 'undetermined'
          : 'denied';

        setStatus(stateName);
        setCanAskAgain(result.canAskAgain);
        setIsLoading(false);
        return stateName;
      }

      setStatus('undetermined');
      setIsLoading(false);
      return 'undetermined';
    } catch {
      setStatus('denied');
      setIsLoading(false);
      return 'denied';
    }
  }, [type]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (type === 'biometrics') {
        if (Platform.OS === 'web') {
          setStatus('unsupported');
          showPopup({
            type: 'warning',
            title: 'Plataforma no soportada',
            message: 'La autenticación biométrica no se encuentra disponible en la versión web.',
          });
          setIsLoading(false);
          return false;
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          setStatus('denied');
          showPopup({
            type: 'warning',
            title: 'Sin hardware biométrico',
            message: 'Este dispositivo no cuenta con sensor de huella, rostro o iris.',
          });
          setIsLoading(false);
          return false;
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          setStatus('denied');
          showPopup({
            type: 'warning',
            title: 'Sin biometría registrada',
            message: 'No hay ninguna huella o rostro registrado en los ajustes de seguridad del sistema.',
          });
          setIsLoading(false);
          return false;
        }

        setStatus('granted');
        setIsLoading(false);
        return true;
      }

      if (type === 'camera') {
        const result = await Camera.requestCameraPermissionsAsync();
        const granted = result.granted;
        setStatus(granted ? 'granted' : 'denied');
        setCanAskAgain(result.canAskAgain);
        setIsLoading(false);

        if (!granted && !result.canAskAgain) {
          showPopup({
            type: 'warning',
            title: 'Permiso de Cámara denegado',
            message: 'El permiso fue denegado de forma permanente. Debes habilitarlo en Ajustes para usar la cámara.',
            actions: [
              { label: 'Cancelar', variant: 'secondary' },
              { label: 'Abrir Ajustes', variant: 'primary', onPress: () => Linking.openSettings() },
            ],
          });
        }
        return granted;
      }

      if (type === 'location') {
        const result = await Location.requestForegroundPermissionsAsync();
        const granted = result.granted;
        setStatus(granted ? 'granted' : 'denied');
        setCanAskAgain(result.canAskAgain);
        setIsLoading(false);

        if (!granted && !result.canAskAgain) {
          showPopup({
            type: 'warning',
            title: 'Permiso de Ubicación denegado',
            message: 'El permiso de ubicación fue denegado. Puedes activarlo en los Ajustes del sistema.',
            actions: [
              { label: 'Cancelar', variant: 'secondary' },
              { label: 'Abrir Ajustes', variant: 'primary', onPress: () => Linking.openSettings() },
            ],
          });
        }
        return granted;
      }

      setIsLoading(false);
      return false;
    } catch {
      setStatus('denied');
      setIsLoading(false);
      return false;
    }
  }, [type, showPopup]);

  const openAppSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      showPopup({
        type: 'error',
        title: 'Error de navegación',
        message: 'No fue posible abrir los ajustes del sistema automáticamente.',
      });
    }
  }, [showPopup]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    type,
    status,
    canAskAgain,
    isGranted: status === 'granted',
    isLoading,
    requestPermission,
    openAppSettings,
    checkPermission,
  };
}
