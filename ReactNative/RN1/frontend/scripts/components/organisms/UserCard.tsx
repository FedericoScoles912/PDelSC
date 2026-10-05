import React from 'react';
import { View, StyleSheet } from 'react-native';
import { User } from '../../types';
import { Label } from '../atoms/Label';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { InfoRow } from '../molecules/InfoRow';
import { useTheme } from '../../hooks/useTheme';

export interface UserCardProps {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  onLogout: () => void;
}

/**
 * Organismo UserCard: Muestra el perfil completo del usuario autenticado,
 * recibiendo sus propiedades por PROPS y distribuyéndolas a componentes hijos InfoRow.
 */
export const UserCard: React.FC<UserCardProps> = ({
  id,
  nombre,
  correo,
  rol,
  onLogout,
}) => {
  const { theme } = useTheme();

  // Obtener iniciales del nombre
  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Color distintivo según rol
  const getRoleBadgeColor = () => {
    switch (rol.toLowerCase()) {
      case 'administrador':
        return { bg: theme.primary, text: '#FFFFFF' };
      case 'editor':
        return { bg: theme.secondary, text: '#FFFFFF' };
      default:
        return { bg: theme.accent, text: '#FFFFFF' };
    }
  };

  const roleColors = getRoleBadgeColor();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      {/* Cabecera del perfil */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Label variant="h2" weight="bold" color="#FFFFFF">
            {getInitials(nombre)}
          </Label>
        </View>

        <View style={styles.nameContainer}>
          <Label variant="h3" weight="bold">
            {nombre}
          </Label>
          <View style={[styles.roleBadge, { backgroundColor: roleColors.bg }]}>
            <Icon name="shield-outline" size={14} color={roleColors.text} />
            <Label
              variant="caption"
              weight="bold"
              color={roleColors.text}
              style={styles.roleText}
            >
              {rol}
            </Label>
          </View>
        </View>
      </View>

      {/* Repartir datos recibidos por PROPS a componentes hijos InfoRow */}
      <View style={styles.infoSection}>
        <Label variant="label" weight="semibold" color={theme.textSecondary} style={styles.sectionTitle}>
          Detalles de la Cuenta
        </Label>

        <InfoRow
          iconName="finger-print-outline"
          label="ID de Usuario en Base de Datos"
          value={`#${id}`}
        />

        <InfoRow
          iconName="person-outline"
          label="Nombre Completo"
          value={nombre}
        />

        <InfoRow
          iconName="mail-outline"
          label="Correo Electrónico"
          value={correo}
          highlight
        />

        <InfoRow
          iconName="ribbon-outline"
          label="Rol y Nivel de Acceso"
          value={rol}
        />
      </View>

      {/* Botón de cierre de sesión */}
      <View style={styles.actionsSection}>
        <Button
          title="Cerrar Sesión"
          variant="outline"
          leftIcon={<Icon name="log-out-outline" size={18} color={theme.primary} />}
          onPress={onLogout}
          accessibilityLabel="Cerrar sesión actual y regresar al inicio"
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  roleText: {
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  infoSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  actionsSection: {
    marginTop: 18,
  },
  logoutButton: {
    width: '100%',
  },
});
