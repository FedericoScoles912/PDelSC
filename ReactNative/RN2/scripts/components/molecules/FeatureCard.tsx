import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { Badge, BadgeProps } from '../atoms/Badge';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: IconName;
  onPress: () => void;
  statusBadge?: {
    label: string;
    variant: BadgeProps['variant'];
  };
  statValue?: string;
}

/**
 * Tarjeta interactiva de acceso a cada sensor o herramienta de hardware para el Dashboard.
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  onPress,
  statusBadge,
  statValue,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${title}`}
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
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          <Icon name={icon} size={28} color={theme.colors.primary} />
        </View>

        {statusBadge && (
          <Badge label={statusBadge.label} variant={statusBadge.variant} size="sm" />
        )}
      </View>

      <Text variant="title" weight="bold" style={{ marginTop: theme.spacing.md }}>
        {title}
      </Text>

      <Text
        variant="bodySm"
        secondary
        numberOfLines={2}
        style={{
          marginTop: theme.spacing.xxs,
          marginBottom: theme.spacing.md,
        }}
      >
        {description}
      </Text>

      <View style={styles.bottomRow}>
        {statValue ? (
          <Text variant="caption" weight="semibold" color={theme.colors.primary}>
            {statValue}
          </Text>
        ) : (
          <View />
        )}

        <View style={styles.arrowRow}>
          <Text variant="bodySm" weight="bold" color={theme.colors.primary}>
            Ingresar
          </Text>
          <Icon
            name="chevron-forward"
            size={16}
            color={theme.colors.primary}
            style={{ marginLeft: 2 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    minHeight: 180,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
