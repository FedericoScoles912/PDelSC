/**
 * TopBar.js
 * Encabezado: menú (mobile), título, alternar tema, cerrar sesión.
 */
import { Pressable, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { useTheme } from '../../Styles/ThemeProvider';
import { toggleDark } from '../../Store/slices/themeSlice';

export function TopBar({ title, onMenuPress, onLogout, right }) {
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between border-b border-warm-200 bg-white px-4 py-3 dark:border-warm-700 dark:bg-warm-900">
      <View className="flex-row items-center gap-3">
        {onMenuPress ? (
          <Pressable onPress={onMenuPress} hitSlop={10}>
            <Icon name="menu" size={20} />
          </Pressable>
        ) : null}
        <Text variant="h2" numberOfLines={1}>{title}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        {right}
        <Pressable
          onPress={() => dispatch(toggleDark())}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-lg border border-warm-200 dark:border-warm-700"
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={16} />
        </Pressable>
        {onLogout ? (
          <Pressable
            onPress={onLogout}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-lg border border-warm-200 dark:border-warm-700"
          >
            <Icon name="logout" size={16} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default TopBar;
