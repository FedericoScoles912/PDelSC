import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePermission } from '../hooks/usePermission';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Row } from '../components/layout/Row';
import { Col } from '../components/layout/Col';
import { Header } from '../components/organisms/Header';
import { PermissionBanner } from '../components/molecules/PermissionBanner';
import { DataRow } from '../components/molecules/DataRow';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Icon } from '../components/atoms/Icon';
import {
  formatCoordinate,
  formatDateTime,
  formatHeading,
} from '../utils/formatters';

/**
 * Pantalla de lectura GPS, seguimiento en tiempo real y geocodificación inversa de ubicación.
 */
const LocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isGranted, status, requestPermission, openAppSettings } = usePermission('location');
  const {
    location,
    startTracking,
    stopTracking,
    refreshLocation,
    openInMapApp,
    copyCoordinates,
  } = useLocationTracker();

  return (
    <ScreenWrapper>
      <Header
        title="GPS y Ubicación"
        subtitle="Posicionamiento global en tiempo real y geocodificación"
      />

      <Container style={{ paddingVertical: theme.spacing.md }}>
        {!isGranted ? (
          <PermissionBanner
            type="location"
            status={status}
            onRequest={requestPermission}
            onOpenSettings={openAppSettings}
          />
        ) : (
          <View style={styles.content}>
            {/* Tarjeta de estado de seguimiento */}
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
                  <Icon name="navigate-circle-outline" size={26} color={theme.colors.primary} />
                  <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                    Seguimiento GPS
                  </Text>
                </View>

                <Badge
                  label={location.isTracking ? 'En Vivo' : 'En Pausa'}
                  variant={location.isTracking ? 'success' : 'neutral'}
                />
              </View>

              <Text variant="bodySm" secondary style={{ marginTop: 4, marginBottom: 16 }}>
                {location.isTracking
                  ? 'Suscrito a cambios continuos de posición con watchPositionAsync.'
                  : 'Presiona Iniciar para registrar la ubicación en movimiento.'}
              </Text>

              <Row gap={theme.spacing.sm}>
                <Col flex={1}>
                  <Button
                    label={location.isTracking ? 'Detener Rastreo' : 'Iniciar Rastreo'}
                    variant={location.isTracking ? 'danger' : 'primary'}
                    icon={location.isTracking ? 'stop-circle-outline' : 'play-circle-outline'}
                    onPress={location.isTracking ? stopTracking : startTracking}
                    loading={location.isLoading}
                    fullWidth
                  />
                </Col>

                <Col flex={1}>
                  <Button
                    label="Actualizar"
                    variant="secondary"
                    icon="refresh-outline"
                    onPress={refreshLocation}
                    disabled={location.isLoading}
                    fullWidth
                  />
                </Col>
              </Row>
            </View>

            {/* Tarjeta de datos de geolocalización */}
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
              <Text variant="headline" weight="bold" style={{ marginBottom: 12 }}>
                Lecturas del Sensor GPS
              </Text>

              <DataRow
                label="Latitud"
                value={formatCoordinate(location.latitude)}
                icon="globe-outline"
                copyable
                onCopy={copyCoordinates}
              />

              <DataRow
                label="Longitud"
                value={formatCoordinate(location.longitude)}
                icon="globe-outline"
                copyable
                onCopy={copyCoordinates}
              />

              <DataRow
                label="Precisión"
                value={location.accuracy ? `± ${location.accuracy.toFixed(1)} metros` : '--'}
                icon="locate-outline"
              />

              <DataRow
                label="Altitud"
                value={location.altitude ? `${location.altitude.toFixed(1)} m sobre el mar` : '--'}
                icon="trending-up-outline"
              />

              <DataRow
                label="Velocidad"
                value={
                  location.speed !== null && location.speed >= 0
                    ? `${(location.speed * 3.6).toFixed(1)} km/h`
                    : 'Estacionario'
                }
                icon="speedometer-outline"
              />

              <DataRow
                label="Rumbo"
                value={formatHeading(location.heading)}
                icon="compass-outline"
              />

              <DataRow
                label="Última lectura"
                value={formatDateTime(location.timestamp)}
                icon="time-outline"
                divider={false}
              />
            </View>

            {/* Dirección por geocodificación inversa */}
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
                <Icon name="map-outline" size={22} color={theme.colors.secondary} />
                <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
                  Dirección Estimada (Geocodificación)
                </Text>
              </View>

              <Text
                variant="body"
                weight="medium"
                style={{
                  marginTop: 8,
                  marginBottom: 16,
                  color: location.address ? theme.colors.text : theme.colors.textSecondary,
                }}
              >
                {location.address ||
                  'Presiona "Actualizar" o "Iniciar Rastreo" para resolver la dirección más cercana.'}
              </Text>

              <Row gap={theme.spacing.sm}>
                <Col flex={1}>
                  <Button
                    label="Abrir en Mapas"
                    variant="outline"
                    icon="map"
                    onPress={openInMapApp}
                    fullWidth
                  />
                </Col>

                <Col flex={1}>
                  <Button
                    label="Copiar Coordenadas"
                    variant="secondary"
                    icon="copy-outline"
                    onPress={copyCoordinates}
                    fullWidth
                  />
                </Col>
              </Row>
            </View>
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

export default LocationScreen;
