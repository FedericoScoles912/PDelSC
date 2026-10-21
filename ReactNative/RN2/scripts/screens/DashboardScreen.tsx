import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { usePermission } from '../hooks/usePermission';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Row } from '../components/layout/Row';
import { Col } from '../components/layout/Col';
import { Header } from '../components/organisms/Header';
import { FeatureCard } from '../components/molecules/FeatureCard';
import { Text } from '../components/atoms/Text';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { ScreenName } from '../types/navigation';
import { formatPercentage } from '../utils/formatters';

export interface DashboardScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

/**
 * Pantalla principal con resumen en vivo de hardware y grilla responsiva de herramientas.
 */
const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const { isDesktop } = useBreakpoint();
  const cameraPerm = usePermission('camera');
  const locationPerm = usePermission('location');
  const biometricPerm = usePermission('biometrics');
  const { battery, network, device } = useDeviceInfo();

  const getStatusBadge = (
    isGranted: boolean,
    status: string
  ): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } => {
    if (isGranted) return { label: 'Concedido', variant: 'success' };
    if (status === 'unsupported') return { label: 'No disponible', variant: 'neutral' };
    if (status === 'denied') return { label: 'Denegado', variant: 'error' };
    return { label: 'Pendiente', variant: 'warning' };
  };

  return (
    <ScreenWrapper>
      <Header
        title="Sensores Hub"
        subtitle="Centro de diagnóstico y control de hardware"
      />

      <Container style={{ paddingTop: theme.spacing.lg }}>
        {/* Banner de resumen en vivo */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.lg,
              padding: isDesktop ? theme.spacing.xl : theme.spacing.lg,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleRow}>
              <Icon name="pulse-outline" size={22} color={theme.colors.primary} />
              <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                Diagnóstico Rápido
              </Text>
            </View>
            <Badge label="En Línea" variant="success" size="sm" />
          </View>

          <Row gap={theme.spacing.md} style={{ marginTop: theme.spacing.md }}>
            <Col flex={1}>
              <View style={styles.statBox}>
                <Icon name="battery-charging-outline" size={20} color={theme.colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="caption" secondary>
                    Batería
                  </Text>
                  <Text variant="body" weight="bold">
                    {battery.batteryLevel !== null
                      ? formatPercentage(battery.batteryLevel)
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </Col>

            <Col flex={1}>
              <View style={styles.statBox}>
                <Icon name="wifi-outline" size={20} color={theme.colors.secondary} />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="caption" secondary>
                    Conectividad
                  </Text>
                  <Text variant="body" weight="bold">
                    {network.networkType}
                  </Text>
                </View>
              </View>
            </Col>

            <Col flex={1}>
              <View style={styles.statBox}>
                <Icon name="phone-portrait-outline" size={20} color={theme.colors.accent} />
                <View style={{ marginLeft: 8 }}>
                  <Text variant="caption" secondary>
                    Dispositivo
                  </Text>
                  <Text variant="body" weight="bold" numberOfLines={1}>
                    {device.modelName || 'Móvil'}
                  </Text>
                </View>
              </View>
            </Col>
          </Row>
        </View>

        {/* Sección de herramientas */}
        <Text
          variant="headline"
          weight="bold"
          style={{
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.md,
          }}
        >
          Herramientas Disponibles
        </Text>

        <Row gap={theme.spacing.lg}>
          <Col>
            <FeatureCard
              title="Cámara"
              description="Captura de fotografías, cambio de lente frontal/trasera y linterna."
              icon="camera-outline"
              statusBadge={getStatusBadge(cameraPerm.isGranted, cameraPerm.status)}
              statValue={cameraPerm.isGranted ? 'Cámara lista' : 'Permiso pendiente'}
              onPress={() => onNavigate('Camera')}
            />
          </Col>

          <Col>
            <FeatureCard
              title="Escáner QR y Barras"
              description="Lectura ultrarrápida de códigos con respuesta háptica y persistencia."
              icon="qr-code-outline"
              statusBadge={getStatusBadge(cameraPerm.isGranted, cameraPerm.status)}
              statValue="Historial activo"
              onPress={() => onNavigate('Scanner')}
            />
          </Col>

          <Col>
            <FeatureCard
              title="GPS y Ubicación"
              description="Seguimiento en vivo, coordenadas, altitud y geocodificación inversa."
              icon="location-outline"
              statusBadge={getStatusBadge(locationPerm.isGranted, locationPerm.status)}
              statValue="watchPositionAsync"
              onPress={() => onNavigate('Location')}
            />
          </Col>

          <Col>
            <FeatureCard
              title="Sensores de Movimiento"
              description="Acelerómetro, giroscopio, brújula magnética y detección de sacudida."
              icon="speedometer-outline"
              statusBadge={{ label: 'Nativo', variant: 'info' }}
              statValue="3 sensores en vivo"
              onPress={() => onNavigate('Motion')}
            />
          </Col>

          <Col>
            <FeatureCard
              title="Biometría"
              description="Validación de identidad con huella dactilar, FaceID o sensor de iris."
              icon="finger-print-outline"
              statusBadge={getStatusBadge(biometricPerm.isGranted, biometricPerm.status)}
              statValue="Hardware seguro"
              onPress={() => onNavigate('Biometric')}
            />
          </Col>

          <Col>
            <FeatureCard
              title="Diagnósticos Extras"
              description="Batería, red en tiempo real, portapapeles y pruebas hápticas."
              icon="hardware-chip-outline"
              statusBadge={{ label: 'Activo', variant: 'success' }}
              statValue="Hardware completo"
              onPress={() => onNavigate('Extras')}
            />
          </Col>

          <Col>
            <FeatureCard
              title="Ajustes y Permisos"
              description="Configuración de tema visual y administración central de permisos."
              icon="settings-outline"
              statusBadge={{ label: 'Sistema', variant: 'neutral' }}
              statValue="Personalización"
              onPress={() => onNavigate('Settings')}
            />
          </Col>
        </Row>
      </Container>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
});

export default DashboardScreen;
