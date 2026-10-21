/**
 * ModalPopup.js
 * Modal base propio (reemplaza alert()/Alert.alert). Centrado, con overlay.
 */
import { Modal, Pressable, View } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { cn } from '../../Utils/cn';

export function ModalPopup({
  visible,
  onClose,
  title,
  children,
  footer,
  maxWidth = 480,
  className,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/45 p-4" onPress={onClose}>
        {/* stopPropagation: evita cerrar al tocar el contenido */}
        <Pressable
          onPress={(e) => e.stopPropagation?.()}
          className={cn(
            'w-full rounded-2xl border border-warm-200 bg-white p-5 dark:border-warm-700 dark:bg-warm-900',
            className,
          )}
          style={{ maxWidth }}
        >
          {title ? (
            <View className="mb-3 flex-row items-center justify-between">
              <Text variant="h3">{title}</Text>
              {onClose ? (
                <Pressable onPress={onClose} hitSlop={8}>
                  <Icon name="close" size={16} className="text-warm-500" />
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {children}
          {footer ? <View className="mt-5 flex-row justify-end gap-2">{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default ModalPopup;
