/**
 * Select.js
 * Selector simple: abre un ModalPopup con las opciones.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { ModalPopup } from './ModalPopup';
import { cn } from '../../Utils/cn';

/**
 * @param {{label?:string, value:any, options:{label:string,value:any}[], onChange:(v:any)=>void, placeholder?:string}} props
 */
export function Select({ label, value, options = [], onChange, placeholder = 'Seleccionar...', className }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className={cn('mb-3', className)}>
      {label ? <Text variant="label" className="mb-1.5">{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-warm-300 bg-white px-3 py-2.5 dark:border-warm-600 dark:bg-warm-900"
      >
        <Text className={selected ? '' : 'text-warm-500'}>
          {selected ? selected.label : placeholder}
        </Text>
        <Icon name="chevronDown" size={14} className="text-warm-500" />
      </Pressable>

      <ModalPopup visible={open} onClose={() => setOpen(false)} title={label || 'Seleccionar'} maxWidth={420}>
        <View>
          {options.map((opt) => (
            <Pressable
              key={String(opt.value)}
              onPress={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                'flex-row items-center justify-between rounded-lg px-3 py-3',
                opt.value === value ? 'bg-brand-50 dark:bg-warm-800' : '',
              )}
            >
              <Text>{opt.label}</Text>
              {opt.value === value ? <Icon name="check" size={14} className="text-brand-600" /> : null}
            </Pressable>
          ))}
        </View>
      </ModalPopup>
    </View>
  );
}

export default Select;
