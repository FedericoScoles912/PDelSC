/**
 * Input.js
 * Campo de texto base. Acepta estilo de error y estados de foco.
 */
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { cn } from '../../Utils/cn';
import { Icon } from './Icon';

export function Input({ className, error, leftIcon, style, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      className={cn(
        'flex-row items-center rounded-xl border bg-white px-3 dark:bg-warm-900',
        error
          ? 'border-danger'
          : focused
            ? 'border-brand-500'
            : 'border-warm-300 dark:border-warm-600',
        className,
      )}
    >
      {leftIcon ? <Icon name={leftIcon} size={16} className="mr-2 text-warm-500" /> : null}
      <TextInput
        className="flex-1 py-2.5 text-base text-warm-900 dark:text-warm-50"
        placeholderTextColor="#9A886B"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={style}
        {...rest}
      />
    </View>
  );
}

export default Input;
