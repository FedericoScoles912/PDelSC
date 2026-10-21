import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { ScreenName } from '../../types/navigation';

export interface TabBarProps {
  currentRoute: ScreenName;
  onNavigate: (route: ScreenName) => void;
}

interface TabItem {
  name: ScreenName;
  label: string;
  icon: IconName;
}

const tabs: TabItem[] = [
  { name: 'Dashboard', label: 'Inicio', icon: 'grid-outline' },
  { name: 'Camera', label: 'Cámara', icon: 'camera-outline' },
  { name: 'Scanner', label: 'Escáner', icon: 'qr-code-outline' },
  { name: 'Location', label: 'GPS', icon: 'location-outline' },
  { name: 'Motion', label: 'Movimiento', icon: 'speedometer-outline' },
  { name: 'Biometric', label: 'Biometría', icon: 'finger-print-outline' },
  { name: 'Extras', label: 'Extras', icon: 'hardware-chip-outline' },
  { name: 'Settings', label: 'Ajustes', icon: 'settings-outline' },
];

/**
 * Organismo de barra de pestañas inferior para dispositivos móviles.
 */
export const TabBar: React.FC<TabBarProps> = ({ currentRoute, onNavigate }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 6),
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => onNavigate(tab.name)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Pestaña ${tab.label}`}
              style={[
                styles.tabItem,
                {
                  borderTopColor: isActive ? theme.colors.primary : 'transparent',
                  borderTopWidth: 3,
                },
              ]}
            >
              <Icon
                name={tab.icon}
                size={22}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                variant="caption"
                weight={isActive ? 'bold' : 'medium'}
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                style={{ marginTop: 2 }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    minHeight: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItem: {
    minWidth: 70,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
