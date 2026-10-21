import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { ScreenName } from '../../types/navigation';
import { APP_INFO } from '../../utils/constants';

export interface SidebarProps {
  currentRoute: ScreenName;
  onNavigate: (route: ScreenName) => void;
}

interface NavItem {
  name: ScreenName;
  label: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { name: 'Camera', label: 'Cámara', icon: 'camera-outline' },
  { name: 'Scanner', label: 'Escáner QR / Barras', icon: 'qr-code-outline' },
  { name: 'Location', label: 'GPS y Ubicación', icon: 'location-outline' },
  { name: 'Motion', label: 'Sensores de Movimiento', icon: 'speedometer-outline' },
  { name: 'Biometric', label: 'Autenticación Biométrica', icon: 'finger-print-outline' },
  { name: 'Extras', label: 'Diagnósticos y Extras', icon: 'hardware-chip-outline' },
  { name: 'Settings', label: 'Ajustes y Permisos', icon: 'settings-outline' },
];

/**
 * Organismo de barra lateral fija para escritorios y pantallas anchas (>= 992px, 1920x1080).
 */
export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.border,
        },
      ]}
    >
      <View style={[styles.brandContainer, { borderBottomColor: theme.colors.border }]}>
        <View
          style={[
            styles.brandIcon,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          <Icon name="hardware-chip" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.brandText}>
          <Text variant="title" weight="bold">
            {APP_INFO.name}
          </Text>
          <Text variant="caption" secondary>
            v{APP_INFO.version}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.navGroup}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.7}
                onPress={() => onNavigate(item.name)}
                accessibilityRole="button"
                accessibilityLabel={`Navegar a ${item.label}`}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: isActive ? theme.colors.surfaceMuted : 'transparent',
                    borderRadius: theme.borderRadius.md,
                    borderLeftColor: isActive ? theme.colors.primary : 'transparent',
                    borderLeftWidth: 4,
                  },
                ]}
              >
                <Icon
                  name={item.icon}
                  size={22}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <Text
                  variant="body"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? theme.colors.primary : theme.colors.text}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Text variant="caption" secondary align="center">
          Modo Responsive Activo
        </Text>
        <Text variant="caption" secondary align="center" style={{ marginTop: 2 }}>
          Expo EAS Ready
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
  },
  brandContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  brandIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandText: {
    flex: 1,
  },
  navScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  navGroup: {
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
