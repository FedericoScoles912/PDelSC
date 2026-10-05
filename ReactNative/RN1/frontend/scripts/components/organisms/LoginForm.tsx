import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FormField } from '../molecules/FormField';
import { PasswordField } from '../molecules/PasswordField';
import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { Icon } from '../atoms/Icon';
import { useTheme } from '../../hooks/useTheme';
import { validateRequired } from '../../utils/validators';
import { LoginCredentials } from '../../types';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
}

/**
 * Organismo LoginForm: Formulario de inicio de sesión con validación interactiva,
 * campos controlados y retroalimentación accesible de estado.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const { theme } = useTheme();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    usuario?: string;
    password?: string;
  }>({});

  const handleValidation = (): boolean => {
    const userVal = validateRequired(usuario, 'El usuario o correo');
    const passVal = validateRequired(password, 'La contraseña');

    const newErrors: { usuario?: string; password?: string } = {};

    if (!userVal.isValid) {
      newErrors.usuario = userVal.error;
    }
    if (!passVal.isValid) {
      newErrors.password = passVal.error;
    }

    setErrors(newErrors);
    return userVal.isValid && passVal.isValid;
  };

  const handleSubmit = async () => {
    if (!handleValidation()) {
      return;
    }

    await onSubmit({
      usuario: usuario.trim(),
      password,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Label variant="h2" weight="bold">
          Iniciar Sesión
        </Label>
        <Label variant="body" color={theme.textSecondary} style={styles.subtitle}>
          Ingresa tus credenciales para acceder al sistema
        </Label>
      </View>

      <FormField
        label="Usuario o Correo Electrónico"
        required
        placeholder="ej. admin o admin@empresa.com"
        value={usuario}
        onChangeText={(text) => {
          setUsuario(text);
          if (errors.usuario) {
            setErrors((prev) => ({ ...prev, usuario: undefined }));
          }
        }}
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.usuario}
        leftIcon={<Icon name="person-outline" size={20} color={theme.textSecondary} />}
      />

      <PasswordField
        label="Contraseña"
        required
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        error={errors.password}
        leftIcon={<Icon name="lock-closed-outline" size={20} color={theme.textSecondary} />}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />

      <View style={styles.submitContainer}>
        <Button
          title={isLoading ? 'Verificando...' : 'Ingresar al Sistema'}
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
          accessibilityLabel="Botón para ingresar al sistema"
          style={styles.submitButton}
        />
      </View>

      <View style={[styles.helpCard, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}>
        <Icon name="information-circle-outline" size={18} color={theme.textSecondary} />
        <View style={styles.helpTextContainer}>
          <Label variant="caption" weight="medium" color={theme.textSecondary}>
            Usuarios de prueba disponibles:
          </Label>
          <Label variant="caption" color={theme.textMuted}>
            • admin / admin123 (Administrador){'\n'}
            • juan.perez / clave456 (Editor){'\n'}
            • maria.lopez / secreto789 (Usuario)
          </Label>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 6,
  },
  submitContainer: {
    marginTop: 8,
  },
  submitButton: {
    width: '100%',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  helpTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
});
