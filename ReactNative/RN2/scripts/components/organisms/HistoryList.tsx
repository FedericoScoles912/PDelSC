import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { ScanHistoryItem } from '../../types/history';
import { formatDateTime } from '../../utils/formatters';

export interface HistoryListProps {
  items: ScanHistoryItem[];
  onClear: () => void;
  onSelectItem: (item: ScanHistoryItem) => void;
}

/**
 * Organismo para listar el historial persistente de códigos escaneados con opciones de acción rápida.
 */
export const HistoryList: React.FC<HistoryListProps> = ({ items, onClear, onSelectItem }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Icon name="time-outline" size={22} color={theme.colors.primary} />
          <Text variant="title" weight="bold" style={{ marginLeft: 8 }}>
            Historial ({items.length})
          </Text>
        </View>

        {items.length > 0 && (
          <Button
            label="Vaciar"
            variant="ghost"
            size="sm"
            onPress={onClear}
            icon="trash-outline"
          />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="barcode-outline" size={40} color={theme.colors.textSecondary} />
          <Text variant="body" secondary style={{ marginTop: 8 }}>
            No hay registros recientes escaneados
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => onSelectItem(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Registro ${item.data}`}
              style={[
                styles.itemRow,
                {
                  borderBottomColor:
                    index < items.length - 1 ? theme.colors.borderLight : 'transparent',
                  borderBottomWidth: index < items.length - 1 ? 1 : 0,
                  paddingVertical: theme.spacing.md,
                },
              ]}
            >
              <View style={styles.itemInfo}>
                <View style={styles.badgeRow}>
                  <Badge
                    label={item.type}
                    variant={item.isUrl ? 'info' : 'neutral'}
                    size="sm"
                  />
                  <Text variant="caption" secondary style={{ marginLeft: 8 }}>
                    {formatDateTime(item.scannedAt)}
                  </Text>
                </View>

                <Text
                  variant="body"
                  weight="medium"
                  numberOfLines={2}
                  style={{ marginTop: 4 }}
                >
                  {item.data}
                </Text>
              </View>

              <Icon name="chevron-forward" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginTop: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
