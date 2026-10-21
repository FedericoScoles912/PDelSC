/**
 * Card.js
 * Superficie contenedora con borde y sombra suave.
 */
import { View } from 'react-native';
import { cn } from '../../Utils/cn';

export function Card({ className, children, padded = true, ...rest }) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-900',
        padded && 'p-4',
        className,
      )}
      style={{
        shadowColor: '#3A3228',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      {...rest}
    >
      {children}
    </View>
  );
}

export default Card;
