import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useMotionSensors } from '../hooks/useMotionSensors';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Row } from '../components/layout/Row';
import { Col } from '../components/layout/Col';
import { Header } from '../components/organisms/Header';
import { SensorPanel } from '../components/organisms/SensorPanel';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Icon } from '../components/atoms/Icon';
import { formatHeading } from '../utils/formatters';
import { SENSOR_UPDATE_INTERVALS } from '../utils/constants';

/**
 * Pantalla de sensores de movimiento: acelerómetro, giroscopio, magnetómetro, brújula y sacudida.
 */
const MotionScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    setIntervalMs,
    toggleActive,
    isPlatformSupported,
  } = useMotionSensors(true);

  const { accelerometer, gyroscope, magnetometer, heading, isShaking, isActive, intervalMs } = state;

  return (
    <ScreenWrapper>
      <Header
        title="Sensores de Movimiento"
        subtitle="Acelerómetro, giroscopio y magnetómetro en tiempo real"
      />

      <Container style={{ paddingVertical: theme.spacing.md }}>
        {!isPlatformSupported ? (
          <View
            style={[
              styles.unsupportedCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.warning,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.xl,
              },
            ]}
          >
            <Icon name="alert-circle-outline" size={40} color={theme.colors.warning} />
            <Text variant="title" weight="bold" style={{ marginTop: 12 }}>
              Sensores de Hardware Inactivos en Web
            </Text>
            <Text variant="body" secondary align="center" style={{ marginTop: 8 }}>
              Los sensores físicos (acelerómetro, giroscopio y magnetómetro) requieren ejecutarse
              en un dispositivo móvil real con Expo Go o compilando el APK.
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Notificación de sacudida (Shake detection) */}
            {isShaking && (
              <View
                style={[
                  styles.shakeAlert,
                  {
                    backgroundColor: theme.colors.warningBackground,
                    borderColor: theme.colors.warning,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <Icon name="hand-left" size={24} color={theme.colors.warning} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text variant="title" weight="bold" color={theme.colors.warning}>
                    ¡Sacudida Detectada!
                  </Text>
                  <Text variant="bodySm" color={theme.colors.text}>
                    El acelerómetro registró un movimiento brusco. Vibración háptica ejecutada.
                  </Text>
                </View>
              </View>
            )}

            {/* Barra de control: Iniciar/Pausar e intervalo */}
            <View
              style={[
                styles.controlsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                },
              ]}
            >
              <View style={styles.controlsHeader}>
                <View style={styles.titleRow}>
                  <Icon name="pulse-outline" size={22} color={theme.colors.primary} />
                  <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                    Flujo de Datos
                  </Text>
                </View>

                <Badge
                  label={isActive ? 'Activo' : 'Pausado'}
                  variant={isActive ? 'success' : 'neutral'}
                />
              </View>

              <Row gap={theme.spacing.sm} style={{ marginTop: 16 }}>
                <Col flex={1}>
                  <Button
                    label={isActive ? 'Pausar Sensores' : 'Reanudar Sensores'}
                    variant={isActive ? 'secondary' : 'primary'}
                    icon={isActive ? 'pause-outline' : 'play-outline'}
                    onPress={toggleActive}
                    fullWidth
                  />
                </Col>
              </Row>

              {/* Selector de intervalo de actualización */}
              <View style={{ marginTop: 16 }}>
                <Text variant="bodySm" weight="semibold" secondary style={{ marginBottom: 8 }}>
                  Frecuencia de Actualización:
                </Text>

                <View style={styles.intervalGroup}>
                  {[
                    { label: 'Rápido (100 ms)', value: SENSOR_UPDATE_INTERVALS.FAST },
                    { label: 'Normal (500 ms)', value: SENSOR_UPDATE_INTERVALS.NORMAL },
                    { label: 'Lento (1000 ms)', value: SENSOR_UPDATE_INTERVALS.SLOW },
                  ].map((option) => {
                    const isSelected = intervalMs === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setIntervalMs(option.value)}
                        accessibilityRole="button"
                        accessibilityLabel={`Intervalo ${option.label}`}
                        style={[
                          styles.intervalBtn,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.surfaceMuted,
                            borderRadius: theme.borderRadius.md,
                            borderColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.borderLight,
                          },
                        ]}
                      >
                        <Text
                          variant="caption"
                          weight="bold"
                          color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Brújula visual con Magnetómetro */}
            <View
              style={[
                styles.compassCard,
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
                <Icon name="compass-outline" size={24} color={theme.colors.accent} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Brújula Digital (Magnetómetro)
                </Text>
              </View>

              <View style={styles.compassVisualContainer}>
                <View
                  style={[
                    styles.compassDial,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text variant="caption" weight="bold" color={theme.colors.error} style={styles.northLabel}>
                    N
                  </Text>
                  <Text variant="caption" weight="bold" color={theme.colors.textSecondary} style={styles.eastLabel}>
                    E
                  </Text>
                  <Text variant="caption" weight="bold" color={theme.colors.textSecondary} style={styles.southLabel}>
                    S
                  </Text>
                  <Text variant="caption" weight="bold" color={theme.colors.textSecondary} style={styles.westLabel}>
                    O
                  </Text>

                  {/* Aguja de la brújula rotada según rumbo calculado */}
                  <View
                    style={[
                      styles.compassNeedle,
                      {
                        transform: [{ rotate: `${heading}deg` }],
                      },
                    ]}
                  >
                    <View style={[styles.needleNorth, { backgroundColor: theme.colors.error }]} />
                    <View style={[styles.needleCenter, { backgroundColor: theme.colors.primary }]} />
                    <View style={[styles.needleSouth, { backgroundColor: theme.colors.textSecondary }]} />
                  </View>
                </View>

                <View style={styles.headingData}>
                  <Text variant="headline" weight="bold" color={theme.colors.primary}>
                    {formatHeading(heading)}
                  </Text>
                  <Text variant="caption" secondary style={{ marginTop: 4 }}>
                    Orientación respecto al norte magnético
                  </Text>
                </View>
              </View>
            </View>

            {/* Paneles de los 3 sensores */}
            <Row gap={theme.spacing.md} style={{ marginTop: 16 }}>
              <Col flex={1}>
                <SensorPanel
                  title="Acelerómetro"
                  subtitle="Aceleración lineal en unidades g (9.8 m/s²)"
                  icon="speedometer-outline"
                  data={accelerometer}
                  min={-2}
                  max={2}
                  unit="g"
                  color={theme.colors.primary}
                />
              </Col>

              <Col flex={1}>
                <SensorPanel
                  title="Giroscopio"
                  subtitle="Velocidad de rotación angular"
                  icon="sync-outline"
                  data={gyroscope}
                  min={-5}
                  max={5}
                  unit="rad/s"
                  color={theme.colors.secondary}
                />
              </Col>

              <Col flex={1}>
                <SensorPanel
                  title="Magnetómetro"
                  subtitle="Intensidad de campo magnético ambiental"
                  icon="magnet-outline"
                  data={magnetometer}
                  min={-100}
                  max={100}
                  unit="μT"
                  color={theme.colors.accent}
                />
              </Col>
            </Row>
          </View>
        )}
      </Container>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  unsupportedCard: {
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 16,
  },
  shakeAlert: {
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlsCard: {
    borderWidth: 1,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  intervalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCard: {
    borderWidth: 1,
  },
  compassVisualContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  compassDial: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  northLabel: { position: 'absolute', top: 6 },
  southLabel: { position: 'absolute', bottom: 6 },
  eastLabel: { position: 'absolute', right: 8 },
  westLabel: { position: 'absolute', left: 8 },
  compassNeedle: {
    width: 6,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  needleNorth: {
    width: 6,
    height: 54,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  needleCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginVertical: -7,
    zIndex: 3,
  },
  needleSouth: {
    width: 6,
    height: 54,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  headingData: {
    alignItems: 'center',
    marginTop: 12,
  },
});

export default MotionScreen;
