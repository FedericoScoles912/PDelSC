/**
 * @file Campo de texto con etiqueta, icono, ayuda y mensaje de error. Soporta
 *       el modo contraseña con botón para mostrar/ocultar.
 * @module client/src/componentes/ui/Entrada
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle
} from 'react-native';

import { cn } from '../../utils/cn';
import { useTema } from '../../tema/TemaProvider';

/** Propiedades del campo de texto. */
export interface EntradaProps extends Omit<TextInputProps, 'style'> {
  /** Etiqueta superior. */
  etiqueta?: string;
  /** Texto de ayuda bajo el campo. */
  ayuda?: string;
  /** Mensaje de error (marca el campo en rojo). */
  error?: string;
  /** Icono a la izquierda. */
  icono?: keyof typeof Ionicons.glyphMap;
  /** Contenedor del campo. */
  contenedorStyle?: StyleProp<ViewStyle>;
  /** Clases del contenedor. */
  clase?: string;
}

/** Campo de texto estilizado. */
export function Entrada({
  etiqueta,
  ayuda,
  error,
  icono,
  contenedorStyle,
  clase,
  secureTextEntry,
  onFocus,
  onBlur,
  editable = true,
  ...resto
}: EntradaProps) {
  const { tokens } = useTema();
  const [enfocado, setEnfocado] = useState(false);
  const [oculto, setOculto] = useState(Boolean(secureTextEntry));
  const hayError = Boolean(error);

  return (
    <View style={contenedorStyle} className={cn('w-full', clase)}>
      {etiqueta && (
        <Text className="mb-1.5 text-sm font-semibold text-texto-suave">{etiqueta}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-xl border bg-superficie px-3',
          hayError ? 'border-peligro' : enfocado ? 'border-primario' : 'border-borde',
          !editable && 'opacity-60'
        )}
      >
        {icono && (
          <Ionicons
            name={icono}
            size={18}
            color={hayError ? tokens.peligro : enfocado ? tokens.primario : tokens.textoSuave}
          />
        )}
        <TextInput
          className="min-h-[44px] flex-1 py-2.5 text-base text-texto"
          placeholderTextColor={tokens.textoSuave}
          editable={editable}
          secureTextEntry={oculto}
          onFocus={(e) => {
            setEnfocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            onBlur?.(e);
          }}
          {...resto}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setOculto((valor) => !valor)}
            className="p-1"
          >
            <Ionicons
              name={oculto ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={tokens.textoSuave}
            />
          </Pressable>
        )}
      </View>
      {hayError ? (
        <Text className="mt-1 text-xs text-peligro">{error}</Text>
      ) : ayuda ? (
        <Text className="mt-1 text-xs text-texto-suave">{ayuda}</Text>
      ) : null}
    </View>
  );
}

/** Área de texto multilínea. */
export function AreaTexto(props: EntradaProps & { filas?: number }) {
  const { filas = 4, ...resto } = props;
  return <Entrada multiline numberOfLines={filas} textAlignVertical="top" {...resto} />;
}
