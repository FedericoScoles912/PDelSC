import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Row } from '../components/layout/Row';
import { Col } from '../components/layout/Col';
import { Header } from '../components/organisms/Header';
import { DataRow } from '../components/molecules/DataRow';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Icon } from '../components/atoms/Icon';
import { formatPercentage } from '../utils/formatters';

/**
 * Pantalla de utilidades y diagnósticos extras: batería, red, hardware, vibración háptica y portapapeles.
 */
const ExtrasScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    battery,
    network,
    device,
    clipboardContent,
    refreshDeviceInfo,
    testHaptic,
    testClipboard,
    refreshClipboard,
  } = useDeviceInfo();

  return (
    <ScreenWrapper>
      <Header
        title="Diagnósticos Extras"
        subtitle="Monitoreo de batería, conectividad, háptica y portapapeles"
      />

      <Container style={{ paddingVertical: theme.spacing.md }}>
        <Row gap={theme.spacing.lg}>
          {/* Tarjeta de Batería */}
          <Col flex={1}>
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
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Icon name="battery-charging-outline" size={24} color={theme.colors.primary} />
                  <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                    Estado de Batería
                  </Text>
                </View>

                <Button
                  label="Actualizar"
                  variant="ghost"
                  size="sm"
                  icon="refresh-outline"
                  onPress={refreshDeviceInfo}
                />
              </View>

              <DataRow
                label="Nivel de Batería"
                value={
                  battery.batteryLevel !== null ? formatPercentage(battery.batteryLevel) : '--'
                }
              />
              <DataRow label="Estado" value={battery.batteryState} />
              <DataRow
                label="Modo Ahorro de Energía"
                value={
                  battery.isLowPowerMode !== null
                    ? battery.isLowPowerMode
                      ? 'Activado'
                      : 'Desactivado'
                    : '--'
                }
                divider={false}
              />
            </View>
          </Col>

          {/* Tarjeta de Conectividad y Red */}
          <Col flex={1}>
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
                <Icon name="wifi-outline" size={24} color={theme.colors.secondary} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Conectividad de Red
                </Text>
              </View>

              <DataRow label="Tipo de Conexión" value={network.networkType} />
              <DataRow label="Conectado a Red">
                <Badge
                  label={network.isConnected ? 'Conectado' : 'Sin Conexión'}
                  variant={network.isConnected ? 'success' : 'error'}
                />
              </DataRow>
              <DataRow label="Acceso a Internet">
                <Badge
                  label={network.isInternetReachable ? 'Disponible' : 'Limitado / No'}
                  variant={network.isInternetReachable ? 'success' : 'warning'}
                />
              </DataRow>
            </View>
          </Col>

          {/* Tarjeta de Información del Dispositivo */}
          <Col flex={1}>
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
                <Icon name="phone-portrait-outline" size={24} color={theme.colors.accent} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Información del Equipo
                </Text>
              </View>

              <DataRow label="Modelo" value={device.modelName} />
              <DataRow label="Marca" value={device.brand} />
              <DataRow label="Fabricante" value={device.manufacturer} />
              <DataRow label="Sistema Operativo" value={`${device.osName} ${device.osVersion}`} />
              <DataRow
                label="Tipo de Dispositivo"
                value={device.isDevice ? 'Dispositivo Físico' : 'Simulador / Emulador'}
                divider={false}
              />
            </View>
          </Col>

          {/* Pruebas de Respuesta Háptica */}
          <Col flex={1}>
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
                <Icon name="finger-print-outline" size={24} color={theme.colors.primary} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Prueba de Motor Háptico
                </Text>
              </View>

              <Text variant="bodySm" secondary style={{ marginTop: 4, marginBottom: 16 }}>
                Prueba los distintos niveles de vibración y patrones hápticos del hardware.
              </Text>

              <Row gap={theme.spacing.sm}>
                <Col flex={1}>
                  <Button
                    label="Ligero"
                    variant="secondary"
                    size="sm"
                    onPress={() => testHaptic('light')}
                    fullWidth
                  />
                </Col>
                <Col flex={1}>
                  <Button
                    label="Medio"
                    variant="secondary"
                    size="sm"
                    onPress={() => testHaptic('medium')}
                    fullWidth
                  />
                </Col>
                <Col flex={1}>
                  <Button
                    label="Fuerte"
                    variant="secondary"
                    size="sm"
                    onPress={() => testHaptic('heavy')}
                    fullWidth
                  />
                </Col>
              </Row>

              <Row gap={theme.spacing.sm} style={{ marginTop: 8 }}>
                <Col flex={1}>
                  <Button
                    label="Éxito"
                    variant="outline"
                    size="sm"
                    onPress={() => testHaptic('success')}
                    fullWidth
                  />
                </Col>
                <Col flex={1}>
                  <Button
                    label="Aviso"
                    variant="outline"
                    size="sm"
                    onPress={() => testHaptic('warning')}
                    fullWidth
                  />
                </Col>
                <Col flex={1}>
                  <Button
                    label="Error"
                    variant="outline"
                    size="sm"
                    onPress={() => testHaptic('error')}
                    fullWidth
                  />
                </Col>
              </Row>
            </View>
          </Col>

          {/* Pruebas de Portapapeles */}
          <Col flex={1}>
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
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Icon name="clipboard-outline" size={24} color={theme.colors.secondary} />
                  <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                    Portapapeles del Sistema
                  </Text>
                </View>

                <Button
                  label="Leer"
                  variant="ghost"
                  size="sm"
                  icon="refresh-outline"
                  onPress={refreshClipboard}
                />
              </View>

              <Text variant="bodySm" secondary style={{ marginTop: 4 }}>
                Contenido actual en memoria:
              </Text>

              <View
                style={[
                  styles.clipboardBox,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.borderLight,
                    borderRadius: theme.borderRadius.sm,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  weight="medium"
                  numberOfLines={3}
                  color={clipboardContent ? theme.colors.text : theme.colors.textSecondary}
                >
                  {clipboardContent || '(El portapapeles está vacío o no se ha leído)'}
                </Text>
              </View>

              <Button
                label="Copiar Texto de Prueba"
                variant="primary"
                size="sm"
                icon="copy-outline"
                onPress={() =>
                  testClipboard(
                    `Sensores Hub Test [${new Date().toLocaleTimeString()}]: Verificación de Portapapeles OK`
                  )
                }
                style={{ marginTop: 12 }}
                fullWidth
              />
            </View>
          </Col>
        </Row>
      </Container>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    width: '100%',
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
    marginBottom: 8,
  },
  clipboardBox: {
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
});

export default ExtrasScreen;
