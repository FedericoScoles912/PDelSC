/**
 * SearchBar.js
 * Barra de búsqueda con ícono y botón de limpiar.
 */
import { Pressable, View } from 'react-native';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';

export function SearchBar({ value, onChangeText, placeholder = 'Buscar...', className, onSubmitEditing, ...rest }) {
  return (
    <View className={className}>
      <Input
        leftIcon="search"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        {...rest}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          className="absolute right-3 top-0 h-full justify-center"
        >
          <Icon name="close" size={14} className="text-warm-500" />
        </Pressable>
      ) : null}
    </View>
  );
}

export default SearchBar;
