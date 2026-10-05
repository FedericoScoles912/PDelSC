import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LoginScreenProps } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { usePopup } from '../hooks/usePopup';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { AuthService } from '../services/authService';
import { LoginCredentials } from '../types';
import { Header } from '../components/organisms/Header';
import { LoginForm } from '../components/organisms/LoginForm';
import { Label } from '../components/atoms/Label';
import { Icon } from '../components/atoms/Icon';

/**
 * Pantalla LoginScreen:
 * Formulario de acceso con diseño responsivo a pantalla completa (100vw x 100vh).
 * En escritorio 1920x1080 muestra un panel decorativo a la izquierda y el formulario a la derecha.
 * En tablet y móvil colapsa a una sola columna táctil accesible.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { showPopup } = usePopup();
  const { isDesktop, width, height } = useBreakpoint();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await AuthService.login(credentials);
      // Navegar a la pantalla de bienvenida enviando el usuario como parámetro de navegación
      navigation.navigate('Welcome', { user });
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al intentar iniciar sesión.';

      // Pop-up propio (NO alert)
      showPopup({
        type: 'error',
        title: 'Error de Autenticación',
        message: mensaje,
        buttonText: 'Reintentar',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.rootContainer,
        {
          backgroundColor: theme.background,
          minHeight: height,
          width: '100%',
        },
      ]}
    >
      <Header title="Portal Corporativo" subtitle="Sistema de Control de Acceso" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.desktopScrollContent : styles.mobileScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.mainWrapper,
            isDesktop ? styles.desktopMainWrapper : styles.mobileMainWrapper,
          ]}
        >
          {/* Panel Decorativo / Branding (Visible en pantallas medianas y grandes / 1920x1080) */}
          {isDesktop && (
            <View
              style={[
                styles.brandPanel,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={[styles.brandIconLarge, { backgroundColor: theme.primary }]}>
                <Icon name="shield-checkmark-outline" size={48} color="#FFFFFF" />
              </View>

              <Label variant="h1" weight="bold" style={styles.brandTitle}>
                Acceso Seguro y Centralizado
              </Label>

              <Label
                variant="body"
                color={theme.textSecondary}
                style={styles.brandDescription}
              >
                Bienvenido al portal institucional. Gestiona tu identidad, recursos corporativos y niveles de autorización con la máxima seguridad.
              </Label>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: theme.accent }]}>
                    <Icon name="lock-closed" size={16} color="#FFFFFF" />
                  </View>
                  <Label variant="body" weight="medium" style={styles.featureText}>
                    Cifrado de contraseñas con bcrypt (cost factor 10)
                  </Label>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: theme.secondary }]}>
                    <Icon name="server" size={16} color="#FFFFFF" />
                  </View>
                  <Label variant="body" weight="medium" style={styles.featureText}>
                    Consultas parametrizadas contra inyección SQL
                  </Label>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureBullet, { backgroundColor: theme.primary }]}>
                    <Icon name="color-palette" size={16} color="#FFFFFF" />
                  </View>
                  <Label variant="body" weight="medium" style={styles.featureText}>
                    Paletas otoñales relajadas con modo claro y oscuro
                  </Label>
                </View>
              </View>
            </View>
          )}

          {/* Panel del Formulario de Login */}
          <View
            style={[
              styles.formPanel,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  desktopScrollContent: {
    paddingHorizontal: 48,
    paddingVertical: 32,
  },
  mobileScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopMainWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 36,
  },
  mobileMainWrapper: {
    flexDirection: 'column',
  },
  brandPanel: {
    flex: 1.2,
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    justifyContent: 'center',
  },
  brandIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    marginBottom: 16,
    lineHeight: 40,
  },
  brandDescription: {
    marginBottom: 32,
    lineHeight: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  formPanel: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    justifyContent: 'center',
  },
});

export default LoginScreen;
