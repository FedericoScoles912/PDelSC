import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Icon, IconName } from '../atoms/Icon';
import { PermissionType, PermissionStatusName } from '../../types/permissions';

export interface PermissionBannerProps {
  type: PermissionType;
  status: PermissionStatusName;
  onRequest: () => void;
  onOpenSettings: () => void;
  isUnsupportedPlatform?: boolean;
}

/**
 * Banner informativo y accionable cuando un permiso no está concedido o no se soporta en la plataforma.
 */
export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  type,
  status,
  onRequest,
  onOpenSettings,
  isUnsupportedPlatform = false,
}) => {
  const { theme } = useTheme();

  const getPermissionDetails = (): {
    title: string;
    description: string;
    icon: IconName;
  } => {
    switch (type) {
      case 'camera':
        return {
          title: 'Permiso de Cámara Requerido',
          description:
            'Para tomar fotografías o escanear códigos es necesario autorizar el acceso a la cámara.',
          icon: 'camera-outline',
        };
      case 'location':
        return {
          title: 'Permiso de Ubicación Requerido',
          description:
            'Para calcular coordenadas en tiempo real y geocodificación es necesario el acceso al GPS.',
          icon: 'location-outline',
        };
      case 'biometrics':
        return {
          title: 'Permiso Biométrico',
          description:
            'Se requiere autorización para interactuar con los sensores de huella o reconocimiento facial.',
          icon: 'finger-print-outline',
        };
    }
  };

  const info = getPermissionDetails();

  if (isUnsupportedPlatform || status === 'unsupported') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.warning,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
          },
        ]}
      >
        <Icon name="alert-circle-outline" size={32} color={theme.colors.warning} />
        <Text variant="title" weight="bold" style={{ marginTop: theme.spacing.sm }}>
          No disponible en esta plataforma
        </Text>
        <Text
          variant="body"
          secondary
          align="center"
          style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}
        >
          Esta función de hardware requiere un dispositivo físico (Android o iOS) y no está habilitada en la versión web.
        </Text>
      </View>
    );
  }

  if (status === 'granted') return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.borderRadius.full,
          },
        ]}
      >
        <Icon name={info.icon} size={32} color={theme.colors.primary} />
      </View>

      <Text variant="title" weight="bold" align="center" style={{ marginTop: theme.spacing.sm }}>
        {info.title}
      </Text>

      <Text
        variant="body"
        secondary
        align="center"
        style={{
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.lg,
        }}
      >
        {info.description}
      </Text>

      <View style={styles.actions}>
        <Button
          label="Solicitar Permiso"
          variant="primary"
          onPress={onRequest}
          style={styles.btn}
        />
        <Button
          label="Abrir Ajustes"
          variant="secondary"
          onPress={onOpenSettings}
          style={[styles.btn, { marginTop: theme.spacing.xs }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  iconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
  },
  btn: {
    width: '100%',
  },
});
