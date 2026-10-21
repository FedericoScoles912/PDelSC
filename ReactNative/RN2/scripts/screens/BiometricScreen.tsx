import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useBiometrics } from '../hooks/useBiometrics';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Header } from '../components/organisms/Header';
import { DataRow } from '../components/molecules/DataRow';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Icon } from '../components/atoms/Icon';

/**
 * Pantalla de verificación biométrica con detección de hardware y prueba de autenticación segura.
 */
const BiometricScreen: React.FC = () => {
  const { theme } = useTheme();
  const { biometricInfo, isAuthenticating, refreshInfo, authenticate } = useBiometrics();

  return (
    <ScreenWrapper>
      <Header
        title="Biometría"
        subtitle="Validación de hardware seguro y autenticación biométrica"
      />

      <Container style={{ paddingVertical: theme.spacing.md }}>
        <View style={styles.content}>
          {/* Tarjeta principal con icono biométrico */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.xl,
                alignItems: 'center',
              },
            ]}
          >
            <View
              style={[
                styles.iconRing,
                {
                  borderColor: biometricInfo.hasHardware
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: theme.colors.surfaceMuted,
                },
              ]}
            >
              <Icon
                name="finger-print"
                size={64}
                color={
                  biometricInfo.hasHardware
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
            </View>

            <Text variant="title" weight="bold" style={{ marginTop: 16 }}>
              Autenticación Local
            </Text>

            <Text
              variant="body"
              secondary
              align="center"
              style={{
                marginTop: 8,
                marginBottom: 24,
                maxWidth: 420,
              }}
            >
              Verifica el estado del sensor biométrico del dispositivo (huella digital, reconocimiento facial o escaneo de iris) y ejecuta un desafío de autenticación.
            </Text>

            <Button
              label={isAuthenticating ? 'Comprobando...' : 'Autenticar Ahora'}
              variant="primary"
              size="lg"
              icon="shield-checkmark-outline"
              loading={isAuthenticating}
              onPress={authenticate}
              style={{ width: '100%', maxWidth: 320 }}
            />
          </View>

          {/* Estado del hardware */}
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
                <Icon name="hardware-chip-outline" size={22} color={theme.colors.primary} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Diagnóstico de Hardware
                </Text>
              </View>

              <Button
                label="Revisar"
                variant="ghost"
                size="sm"
                icon="refresh-outline"
                onPress={refreshInfo}
              />
            </View>

            <DataRow label="Soporte en Plataforma">
              <Badge
                label={biometricInfo.isSupportedOnPlatform ? 'Compatible' : 'Web Incompatible'}
                variant={biometricInfo.isSupportedOnPlatform ? 'success' : 'warning'}
              />
            </DataRow>

            <DataRow label="Sensor Físico Disponible">
              <Badge
                label={biometricInfo.hasHardware ? 'Disponible' : 'No Detectado'}
                variant={biometricInfo.hasHardware ? 'success' : 'error'}
              />
            </DataRow>

            <DataRow label="Biometría Registrada">
              <Badge
                label={biometricInfo.isEnrolled ? 'Registrada' : 'Sin Datos'}
                variant={biometricInfo.isEnrolled ? 'success' : 'warning'}
              />
            </DataRow>

            <DataRow
              label="Tipos Soportados"
              value={
                biometricInfo.supportedTypes.length > 0
                  ? biometricInfo.supportedTypes.join(', ')
                  : 'Ninguno'
              }
              divider={false}
            />
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
  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BiometricScreen;
