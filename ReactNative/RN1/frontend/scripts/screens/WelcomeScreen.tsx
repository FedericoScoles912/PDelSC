import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { WelcomeScreenProps } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { Header } from '../components/organisms/Header';
import { UserCard } from '../components/organisms/UserCard';
import { Container } from '../components/grid/Container';
import { Row } from '../components/grid/Row';
import { Col } from '../components/grid/Col';
import { Label } from '../components/atoms/Label';
import { Icon } from '../components/atoms/Icon';
import { InfoRow } from '../molecules/InfoRow';

/**
 * Pantalla WelcomeScreen:
 * Recibe los datos del usuario autenticado por PROPS desde la navegación (route.params.user).
 * Reparte los datos recibidos mediante PROPS a componentes hijos (UserCard, InfoRow).
 * En pantalla 1920x1080 aprovecha todo el ancho con un dashboard modular de múltiples columnas.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();

  // Recepción tipada de los datos del usuario por PROPS de navegación
  const { user } = route.params;

  const handleLogout = () => {
    // Regresar al login y limpiar la pila
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Header
        title="Dashboard de Usuario"
        subtitle={`Sesión iniciada como ${user.nombre}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container fluid style={styles.dashboardContainer}>
          {/* Banner de Bienvenida Superior */}
          <View
            style={[
              styles.welcomeBanner,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.bannerText}>
              <Label variant="h1" weight="bold">
                ¡Bienvenido/a de nuevo, {user.nombre}! 👋
              </Label>
              <Label
                variant="body"
                color={theme.textSecondary}
                style={styles.bannerSubtitle}
              >
                Autenticación completada con éxito. Has ingresado al sistema con credenciales validadas.
              </Label>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: theme.successBackground, borderColor: theme.success }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <Label variant="caption" weight="bold" color={theme.success}>
                Sesión Activa
              </Label>
            </View>
          </View>

          {/* Grilla 12 Columnas: En 1920x1080 distribuye tarjetas en columnas ricas y equilibradas */}
          <Row gutter={24}>
            {/* Columna Izquierda: Tarjeta principal de perfil de usuario */}
            <Col xs={12} md={12} lg={5} xl={4}>
              <UserCard
                id={user.id}
                nombre={user.nombre}
                correo={user.correo}
                rol={user.rol}
                onLogout={handleLogout}
              />
            </Col>

            {/* Columna Central: Resumen de permisos y privilegios del rol */}
            <Col xs={12} md={6} lg={4} xl={4}>
              <View
                style={[
                  styles.dashboardCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowColor: theme.shadow,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIcon, { backgroundColor: theme.accent }]}>
                    <Icon name="key-outline" size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Label variant="h3" weight="bold">
                      Permisos del Rol
                    </Label>
                    <Label variant="caption" color={theme.textSecondary}>
                      Nivel asignado: {user.rol}
                    </Label>
                  </View>
                </View>

                <View style={styles.permissionsList}>
                  <InfoRow
                    iconName="checkmark-circle-outline"
                    label="Lectura de datos generales"
                    value="Permitido"
                  />
                  <InfoRow
                    iconName={user.rol === 'Administrador' || user.rol === 'Editor' ? 'checkmark-circle-outline' : 'close-circle-outline'}
                    label="Modificación de contenidos"
                    value={user.rol === 'Administrador' || user.rol === 'Editor' ? 'Habilitado' : 'Restringido'}
                  />
                  <InfoRow
                    iconName={user.rol === 'Administrador' ? 'shield-checkmark-outline' : 'close-circle-outline'}
                    label="Gestión de usuarios y base de datos"
                    value={user.rol === 'Administrador' ? 'Acceso Total' : 'Sin Acceso'}
                  />
                </View>
              </View>
            </Col>

            {/* Columna Derecha: Métricas y estado del entorno */}
            <Col xs={12} md={6} lg={3} xl={4}>
              <View
                style={[
                  styles.dashboardCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowColor: theme.shadow,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIcon, { backgroundColor: theme.secondary }]}>
                    <Icon name="analytics-outline" size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Label variant="h3" weight="bold">
                      Estado del Sistema
                    </Label>
                    <Label variant="caption" color={theme.textSecondary}>
                      Información de conexión segura
                    </Label>
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <InfoRow
                    iconName="server-outline"
                    label="Motor de Base de Datos"
                    value="MySQL 8 / MariaDB"
                  />
                  <InfoRow
                    iconName="lock-closed-outline"
                    label="Algoritmo Criptográfico"
                    value="Bcrypt (Salt 10)"
                  />
                  <InfoRow
                    iconName="phone-portrait-outline"
                    label="Plataforma de Ejecución"
                    value="React Native + Expo Web"
                  />
                </View>
              </View>
            </Col>
          </Row>
        </Container>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  dashboardContainer: {
    maxWidth: 1600,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  bannerText: {
    flex: 1,
    minWidth: 280,
  },
  bannerSubtitle: {
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dashboardCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionsList: {
    gap: 4,
  },
  statsContainer: {
    gap: 4,
  },
});

export default WelcomeScreen;
