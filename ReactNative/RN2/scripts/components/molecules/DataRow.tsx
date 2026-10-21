import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';

export interface DataRowProps {
  label: string;
  value?: string | number | null;
  icon?: IconName;
  onPress?: () => void;
  copyable?: boolean;
  onCopy?: () => void;
  children?: React.ReactNode;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Molécula para desplegar pares clave-valor de diagnósticos y lecturas de hardware.
 */
export const DataRow: React.FC<DataRowProps> = ({
  label,
  value,
  icon,
  onPress,
  copyable = false,
  onCopy,
  children,
  divider = true,
  style,
}) => {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        {
          paddingVertical: theme.spacing.sm,
          borderBottomColor: divider ? theme.colors.borderLight : 'transparent',
          borderBottomWidth: divider ? 1 : 0,
        },
        style,
      ]}
    >
      <View style={styles.leftGroup}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: theme.spacing.sm }}
          />
        )}
        <Text variant="body" weight="medium" secondary>
          {label}
        </Text>
      </View>

      <View style={styles.rightGroup}>
        {children ? (
          children
        ) : (
          <Text variant="body" weight="semibold">
            {value !== null && value !== undefined ? String(value) : '--'}
          </Text>
        )}
        {copyable && onCopy && (
          <TouchableOpacity
            onPress={onCopy}
            accessibilityLabel={`Copiar ${label}`}
            style={[styles.copyBtn, { marginLeft: theme.spacing.xs }]}
          >
            <Icon name="copy-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  copyBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
