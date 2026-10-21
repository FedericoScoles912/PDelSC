import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePermission } from '../hooks/usePermission';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Header } from '../components/organisms/Header';
import { ThemeToggle } from '../components/molecules/ThemeToggle';
import { DataRow } from '../components/molecules/DataRow';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Icon } from '../components/atoms/Icon';
import { APP_INFO } from '../utils/constants';

/**
 * Pantalla de configuración del sistema: selector de tema visual y administración central de permisos.
 */
const SettingsScreen: React.FC = () => {
  const { theme, mode } = useTheme();
  const cameraPerm = usePermission('camera');
  const locationPerm = usePermission('location');
  const biometricPerm = usePermission('biometrics');

  const getPermissionBadge = (
    isGranted: boolean,
    status: string
  ): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } => {
    if (isGranted) return { label: 'Concedido', variant: 'success' };
    if (status === 'unsupported') return { label: 'No Soportado', variant: 'neutral' };
    if (status === 'denied') return { label: 'Denegado', variant: 'error' };
    return { label: 'Pendiente', variant: 'warning' };
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      // Ignorar fallo si la plataforma no lo soporta
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Ajustes y Permisos"
        subtitle="Preferencias visuales y control de privacidad del dispositivo"
      />

      <Container style={{ paddingVertical: theme.spacing.md }}>
        <View style={styles.content}>
          {/* Sección de Tema */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Icon name="color-palette-outline" size={24} color={theme.colors.primary} />
              <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                Apariencia Visual
              </Text>
            </View>

            <Text variant="bodySm" secondary style={{ marginTop: 4, marginBottom: 16 }}>
              Personaliza el esquema de color entre modo claro, modo oscuro o sincronizado con el
              sistema operativo.
            </Text>

            <ThemeToggle />

            <View style={{ marginTop: 12 }}>
              <Text variant="caption" secondary>
                Modo activo:{' '}
                <Text variant="caption" weight="bold" color={theme.colors.primary}>
                  {mode === 'system' ? 'Seguir al Sistema' : mode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                </Text>
              </Text>
            </View>
          </View>

          {/* Sección de Permisos Centralizados */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                marginTop: 16,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Icon name="shield-checkmark-outline" size={24} color={theme.colors.secondary} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Estado de Permisos
                </Text>
              </View>

              <Button
                label="Abrir Ajustes"
                variant="outline"
                size="sm"
                icon="settings"
                onPress={handleOpenSettings}
              />
            </View>

            <Text variant="bodySm" secondary style={{ marginTop: 4, marginBottom: 12 }}>
              Consulta el estado de cada permiso requerido por los módulos de hardware.
            </Text>

            <DataRow label="Cámara y Lector de Códigos" icon="camera-outline">
              <Badge {...getPermissionBadge(cameraPerm.isGranted, cameraPerm.status)} />
            </DataRow>

            <DataRow label="Ubicación GPS (Primer Plano)" icon="location-outline">
              <Badge {...getPermissionBadge(locationPerm.isGranted, locationPerm.status)} />
            </DataRow>

            <DataRow label="Autenticación Biométrica" icon="finger-print-outline" divider={false}>
              <Badge {...getPermissionBadge(biometricPerm.isGranted, biometricPerm.status)} />
            </DataRow>

            <Button
              label="Revalidar Permisos"
              variant="secondary"
              size="sm"
              icon="refresh-outline"
              style={{ marginTop: 16 }}
              onPress={async () => {
                await Promise.all([
                  cameraPerm.checkPermission(),
                  locationPerm.checkPermission(),
                  biometricPerm.checkPermission(),
                ]);
              }}
              fullWidth
            />
          </View>

          {/* Información de la App */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                marginTop: 16,
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Icon name="information-circle-outline" size={24} color={theme.colors.accent} />
              <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                Acerca de la Aplicación
              </Text>
            </View>

            <DataRow label="Nombre" value={APP_INFO.name} />
            <DataRow label="Versión" value={`v${APP_INFO.version}`} />
            <DataRow label="Arquitectura" value="React Native + Expo SDK 52" />
            <DataRow label="Generación de APK" value="Expo EAS Build (Perfil Preview)" divider={false} />
          </View>
        </View>
      </Container>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  card: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SettingsScreen;
