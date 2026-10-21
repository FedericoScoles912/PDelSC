import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { BiometricInfo } from '../types/sensors';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Servicio de autenticación biométrica y verificación de hardware.
 */
export const biometricService = {
  /**
   * Obtiene la información sobre capacidades biométricas del dispositivo.
   */
  async getBiometricCapabilities(): Promise<BiometricInfo> {
    if (Platform.OS === 'web') {
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        isSupportedOnPlatform: false,
      };
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      const supportedTypes: string[] = types.map((t) => {
        switch (t) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Huella dactilar';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Reconocimiento facial';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Escáner de iris';
          default:
            return 'Biometría compatible';
        }
      });

      return {
        hasHardware,
        isEnrolled,
        supportedTypes,
        isSupportedOnPlatform: true,
      };
    } catch {
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        isSupportedOnPlatform: false,
      };
    }
  },

  /**
   * Ejecuta la autenticación biométrica con un mensaje descriptivo.
   */
  async authenticate(prompt = 'Confirma tu identidad en Sensores Hub'): Promise<AuthResult> {
    if (Platform.OS === 'web') {
      return {
        success: false,
        error: 'La autenticación biométrica no está soportada en entorno Web.',
      };
    }

    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt,
        fallbackLabel: 'Ingresar PIN / Contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (res.success) {
        return { success: true };
      }

      return {
        success: false,
        error: res.error || 'Autenticación cancelada o no reconocida.',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar la autenticación biométrica.';
      return {
        success: false,
        error: message,
      };
    }
  },
};
