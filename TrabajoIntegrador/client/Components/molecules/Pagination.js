/**
 * Pagination.js
 * Controles de paginación para listas.
 */
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';

/**
 * @param {{meta?:{page:number,totalPages:number,total:number}, onPage:(p:number)=>void}} props
 */
export function Pagination({ meta, onPage, className }) {
  if (!meta) return null;
  const { page = 1, totalPages = 1, total = 0 } = meta;
  return (
    <View className={`flex-row items-center justify-between pt-3 ${className || ''}`}>
      <Text variant="caption" muted>
        Página {page} de {totalPages} · {total} registros
      </Text>
      <View className="flex-row gap-2">
        <Button
          size="sm"
          variant="secondary"
          label="Anterior"
          disabled={page <= 1}
          onPress={() => onPage(page - 1)}
        />
        <Button
          size="sm"
          variant="secondary"
          label="Siguiente"
          disabled={page >= totalPages}
          onPress={() => onPage(page + 1)}
        />
      </View>
    </View>
  );
}

export default Pagination;
