/**
 * AuditoriaScreen.js
 * Bitácora de auditoría (sólo Administrador) con detalle de cambios.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { Badge } from '../Components/atoms/Badge';
import { IconButton } from '../Components/atoms/IconButton';
import { FormField } from '../Components/molecules/FormField';
import { Pagination } from '../Components/molecules/Pagination';
import { ModalPopup } from '../Components/molecules/ModalPopup';
import { DataTable } from '../Components/organisms/DataTable';
import { useGetAuditoriaQuery } from '../Store/apiSlice';
import { formatDate as fmtDate } from '../Utils/format';

const ACCION_TONE = {
  CREAR: 'success',
  ACTUALIZAR: 'info',
  ELIMINAR: 'danger',
  LOGIN: 'brand',
  REGISTRO: 'brand',
  ACTIVAR: 'success',
  DESACTIVAR: 'warning',
};

export function AuditoriaScreen() {
  const [filtros, setFiltros] = useState({ page: 1, limit: 20, entidad: '', accion: '' });
  const [detalle, setDetalle] = useState(null);

  const { data, isLoading, isFetching } = useGetAuditoriaQuery({
    page: filtros.page,
    limit: filtros.limit,
    entidad: filtros.entidad || undefined,
    accion: filtros.accion || undefined,
  });

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;

  const set = (patch) => setFiltros((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const columns = useMemo(() => [
    { key: 'creado_en', label: 'Fecha', width: 160, render: (a) => <Text className="text-sm">{fmtDate(a.creado_en, { conHora: true })}</Text> },
    { key: 'usuario', label: 'Usuario', width: 160, render: (a) => <Text className="text-sm" muted>{a.usuario || 'Sistema'}</Text> },
    { key: 'accion', label: 'Acción', width: 150, render: (a) => <Badge tone={ACCION_TONE[a.accion] || 'neutral'} label={a.accion} /> },
    { key: 'entidad', label: 'Entidad', width: 130, render: (a) => <Text className="text-sm">{a.entidad}{a.entidad_id ? ` #${a.entidad_id}` : ''}</Text> },
    { key: 'ip', label: 'IP', width: 130, render: (a) => <Text className="text-sm" muted>{a.ip || '—'}</Text> },
  ], []);

  const renderJson = (v) => {
    if (!v) return '—';
    try {
      return JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2);
    } catch {
      return String(v);
    }
  };

  return (
    <View>
      <Text variant="h2" className="mb-1">Auditoría</Text>
      <Text muted className="mb-4">Registro de acciones sobre el sistema</Text>

      <Card className="mb-4">
        <View className="flex-row flex-wrap items-end gap-3">
          <View className="min-w-[200px] flex-1">
            <FormField label="Entidad" value={filtros.entidad} onChangeText={(v) => set({ entidad: v })} placeholder="producto, usuario, movimiento..." />
          </View>
          <View className="min-w-[200px] flex-1">
            <FormField label="Acción" value={filtros.accion} onChangeText={(v) => set({ accion: v.toUpperCase() })} placeholder="CREAR, ACTUALIZAR..." />
          </View>
        </View>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading || isFetching}
          emptyTitle="Sin registros"
          actionsWidth={60}
          onRowPress={setDetalle}
          renderActions={(a) => <IconButton name="search" size={30} onPress={() => setDetalle(a)} />}
        />
        <View className="px-3">
          <Pagination meta={meta} onPage={(p) => setFiltros((f) => ({ ...f, page: p }))} />
        </View>
      </Card>

      <ModalPopup
        visible={!!detalle}
        onClose={() => setDetalle(null)}
        title="Detalle del registro"
        maxWidth={720}
        footer={<Button variant="secondary" label="Cerrar" onPress={() => setDetalle(null)} />}
      >
        <View>
          <Text variant="label" className="mb-1">Acción</Text>
          <Text muted className="mb-3">{detalle?.accion} · {detalle?.entidad}{detalle?.entidad_id ? ` #${detalle.entidad_id}` : ''}</Text>

          <Text variant="label" className="mb-1">Datos anteriores</Text>
          <Card className="mb-3 bg-warm-100 dark:bg-warm-800">
            <Text variant="mono" className="text-xs">{renderJson(detalle?.datos_antes)}</Text>
          </Card>

          <Text variant="label" className="mb-1">Datos posteriores</Text>
          <Card className="bg-warm-100 dark:bg-warm-800">
            <Text variant="mono" className="text-xs">{renderJson(detalle?.datos_despues)}</Text>
          </Card>
        </View>
      </ModalPopup>
    </View>
  );
}

export default AuditoriaScreen;
