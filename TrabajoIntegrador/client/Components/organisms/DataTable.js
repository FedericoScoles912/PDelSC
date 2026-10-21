/**
 * DataTable.js
 * Tabla genérica multiplataforma (header + filas) con scroll horizontal.
 *
 * columns: [{ key, label, width, align, render(item) -> ReactNode }]
 */
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../atoms/Text';
import { EmptyState } from '../molecules/EmptyState';
import { cn } from '../../Utils/cn';

const ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };

export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle = 'Sin resultados',
  emptyMessage,
  onRowPress,
  actionsWidth = 0,
  renderActions,
  className,
}) {
  const colWidth = (col) => (col.width ? { width: col.width } : { flex: 1, minWidth: col.minWidth || 120 });

  if (!loading && data.length === 0) {
    return (
      <View className={className}>
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className={className}>
      <View style={{ minWidth: 640 }} className="flex-1">
        {/* Cabecera */}
        <View className="flex-row border-b border-warm-200 bg-warm-100 px-3 py-2.5 dark:border-warm-700 dark:bg-warm-800">
          {columns.map((col) => (
            <View key={col.key} style={[colWidth(col), { alignItems: ALIGN[col.align || 'left'] }]}>
              <Text variant="caption" className="font-semibold uppercase tracking-wide" muted>
                {col.label}
              </Text>
            </View>
          ))}
          {renderActions ? (
            <View style={{ width: actionsWidth || 96, alignItems: 'flex-end' }}>
              <Text variant="caption" className="font-semibold uppercase tracking-wide" muted>Acciones</Text>
            </View>
          ) : null}
        </View>

        {/* Filas */}
        {loading ? (
          <EmptyState loading />
        ) : (
          data.map((item, idx) => (
            <Pressable
              key={item[keyField] ?? idx}
              onPress={onRowPress ? () => onRowPress(item) : undefined}
              className={cn(
                'flex-row items-center border-b border-warm-100 px-3 py-2.5 dark:border-warm-800',
                idx % 2 === 1 ? 'bg-warm-50/60 dark:bg-warm-900/40' : '',
              )}
              style={({ pressed }) => (pressed && onRowPress ? { opacity: 0.75 } : undefined)}
            >
              {columns.map((col) => (
                <View key={col.key} style={[colWidth(col), { alignItems: ALIGN[col.align || 'left'] }]}>
                  {col.render ? col.render(item) : (
                    <Text numberOfLines={1} className="text-sm">{String(item[col.key] ?? '—')}</Text>
                  )}
                </View>
              ))}
              {renderActions ? (
                <View style={{ width: actionsWidth || 96, alignItems: 'flex-end' }}>
                  {renderActions(item)}
                </View>
              ) : null}
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default DataTable;
