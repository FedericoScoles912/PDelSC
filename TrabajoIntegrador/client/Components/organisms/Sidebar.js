/**
 * Sidebar.js
 * Navegación lateral con los ítems permitidos para el rol.
 */
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { cn } from '../../Utils/cn';
import { rolLabel } from '../../Utils/roles';

export function Sidebar({ items = [], active, onSelect, usuario, onLogout, className }) {
  return (
    <View className={cn('h-full w-64 bg-warm-900 px-3 py-4 dark:bg-[#120F0C]', className)}>
      {/* Marca */}
      <View className="mb-6 flex-row items-center gap-2 px-2">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
          <Text className="text-base font-bold text-white">R</Text>
        </View>
        <View>
          <Text className="text-base font-bold text-white">Retenes EMIC</Text>
          <Text variant="caption" className="text-warm-400">Control de Stock</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {items.map((item) => {
          const isActive = item.name === active;
          return (
            <Pressable
              key={item.name}
              onPress={() => onSelect?.(item.name)}
              className={cn(
                'mb-1 flex-row items-center gap-3 rounded-xl px-3 py-2.5',
                isActive ? 'bg-brand-600' : '',
              )}
              style={({ pressed }) => (pressed && !isActive ? { backgroundColor: 'rgba(255,255,255,0.06)' } : undefined)}
            >
              <Icon name={item.icon} size={16} className={isActive ? 'text-white' : 'text-warm-300'} />
              <Text className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-warm-200')}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Usuario + salir */}
      <View className="mt-3 border-t border-white/10 pt-3">
        <View className="mb-2 px-2">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario'}
          </Text>
          <Text variant="caption" className="text-warm-400">{rolLabel(usuario?.rol)}</Text>
        </View>
        <Pressable
          onPress={onLogout}
          className="flex-row items-center gap-3 rounded-xl px-3 py-2.5"
          style={({ pressed }) => (pressed ? { backgroundColor: 'rgba(255,255,255,0.06)' } : undefined)}
        >
          <Icon name="logout" size={16} className="text-warm-300" />
          <Text className="text-sm font-medium text-warm-200">Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Sidebar;
