/**
 * ConfiguracionScreen.js
 * Parámetros del sistema (clave-valor). Sólo Administrador.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { IconButton } from '../Components/atoms/IconButton';
import { FormField } from '../Components/molecules/FormField';
import { EmptyState } from '../Components/molecules/EmptyState';
import { ModalPopup } from '../Components/molecules/ModalPopup';
import { useFeedback } from '../Components/organisms/FeedbackProvider';
import { useGetConfigQuery, useActualizarConfigMutation } from '../Store/apiSlice';

export function ConfiguracionScreen() {
  const { toast } = useFeedback();
  const { data, isLoading } = useGetConfigQuery();
  const [actualizar, { isLoading: guardando }] = useActualizarConfigMutation();
  const [edit, setEdit] = useState({ visible: false, clave: '', valor: '', descripcion: '' });

  const items = data?.data ?? [];

  const abrir = (c) => setEdit({ visible: true, clave: c.clave, valor: c.valor ?? '', descripcion: c.descripcion });

  const guardar = async () => {
    try {
      await actualizar({ clave: edit.clave, valor: edit.valor }).unwrap();
      toast({ message: 'Parámetro actualizado', tone: 'success' });
      setEdit({ visible: false, clave: '', valor: '', descripcion: '' });
    } catch (err) {
      toast({ message: err?.data?.error?.message || 'No se pudo actualizar', tone: 'error' });
    }
  };

  return (
    <View>
      <Text variant="h2" className="mb-1">Configuración</Text>
      <Text muted className="mb-4">Parámetros generales del sistema</Text>

      {isLoading ? (
        <EmptyState loading />
      ) : items.length === 0 ? (
        <EmptyState icon="config" title="Sin parámetros" message="No hay claves de configuración cargadas." />
      ) : (
        <View className="gap-3">
          {items.map((c) => (
            <Card key={c.clave}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold">{c.clave}</Text>
                  {c.descripcion ? <Text variant="caption" muted className="mt-0.5">{c.descripcion}</Text> : null}
                  <Text variant="mono" className="mt-2 text-xs">{c.valor ?? '—'}</Text>
                </View>
                <IconButton name="edit" size={32} onPress={() => abrir(c)} />
              </View>
            </Card>
          ))}
        </View>
      )}

      <ModalPopup
        visible={edit.visible}
        onClose={() => setEdit({ visible: false, clave: '', valor: '', descripcion: '' })}
        title="Editar parámetro"
        maxWidth={520}
        footer={
          <>
            <Button variant="secondary" label="Cancelar" onPress={() => setEdit({ visible: false, clave: '', valor: '', descripcion: '' })} />
            <Button label="Guardar" loading={guardando} onPress={guardar} />
          </>
        }
      >
        <View>
          <Text variant="label" className="mb-1">Clave</Text>
          <Text muted className="mb-3">{edit.clave}</Text>
          {edit.descripcion ? <Text variant="caption" muted className="mb-2">{edit.descripcion}</Text> : null}
          <FormField
            label="Valor"
            value={edit.valor}
            onChangeText={(v) => setEdit((s) => ({ ...s, valor: v }))}
            multiline
          />
        </View>
      </ModalPopup>
    </View>
  );
}

export default ConfiguracionScreen;
