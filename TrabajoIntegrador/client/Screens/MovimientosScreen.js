/**
 * MovimientosScreen.js
 * Historial de movimientos de stock y registro de ingresos/egresos/ajustes.
 */
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { Badge } from '../Components/atoms/Badge';
import { FormField } from '../Components/molecules/FormField';
import { Select } from '../Components/molecules/Select';
import { SearchBar } from '../Components/molecules/SearchBar';
import { Pagination } from '../Components/molecules/Pagination';
import { ModalPopup } from '../Components/molecules/ModalPopup';
import { DataTable } from '../Components/organisms/DataTable';
import { useFeedback } from '../Components/organisms/FeedbackProvider';
import {
  useGetMovimientosQuery, useRegistrarMovimientoMutation, useGetProductosQuery,
} from '../Store/apiSlice';
import { formatDate as fmtDate, timeAgo } from '../Utils/format';

const TIPO_TONE = { INGRESO: 'success', EGRESO: 'danger', AJUSTE: 'warning' };
const tipoOptions = [
  { label: 'Todos', value: null },
  { label: 'Ingreso', value: 'INGRESO' },
  { label: 'Egreso', value: 'EGRESO' },
  { label: 'Ajuste', value: 'AJUSTE' },
];
const tipoFormOptions = [
  { label: 'Ingreso (+ stock)', value: 'INGRESO' },
  { label: 'Egreso (- stock)', value: 'EGRESO' },
  { label: 'Ajuste (fija el stock)', value: 'AJUSTE' },
];

const formVacio = { tipo: 'INGRESO', cantidad: '', motivo: '', referencia: '' };

export function MovimientosScreen() {
  const { toast } = useFeedback();
  const [filtros, setFiltros] = useState({ page: 1, limit: 15, tipo: null, desde: '', hasta: '' });
  const [modal, setModal] = useState({ visible: false, producto: null, busq: '', values: formVacio, error: '' });

  const { data, isLoading, isFetching } = useGetMovimientosQuery({
    page: filtros.page,
    limit: filtros.limit,
    tipo: filtros.tipo || undefined,
    desde: filtros.desde || undefined,
    hasta: filtros.hasta || undefined,
  });
  const [registrar, { isLoading: guardando }] = useRegistrarMovimientoMutation();

  const { data: prodData, isFetching: buscandoProd } = useGetProductosQuery(
    { codigo: modal.busq, limit: 8 },
    { skip: modal.busq.trim().length < 2 },
  );

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;
  const resultados = prodData?.data?.items ?? [];

  const set = (patch) => setFiltros((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  const setVal = (k) => (v) => setModal((s) => ({ ...s, values: { ...s.values, [k]: v } }));

  const abrirNuevo = () => setModal({ visible: true, producto: null, busq: '', values: formVacio, error: '' });

  const guardar = async () => {
    if (!modal.producto) {
      setModal((s) => ({ ...s, error: 'Seleccioná un producto' }));
      return;
    }
    const cantidad = Number(modal.values.cantidad);
    if (!cantidad || cantidad <= 0) {
      setModal((s) => ({ ...s, error: 'La cantidad debe ser mayor a 0' }));
      return;
    }
    try {
      const res = await registrar({
        productoId: modal.producto.id,
        tipo: modal.values.tipo,
        cantidad,
        motivo: modal.values.motivo?.trim() || undefined,
        referencia: modal.values.referencia?.trim() || undefined,
      }).unwrap();
      toast({ message: `Movimiento registrado: stock ${res.data.stockAnterior} → ${res.data.stockNuevo}`, tone: 'success' });
      setModal({ visible: false, producto: null, busq: '', values: formVacio, error: '' });
    } catch (err) {
      setModal((s) => ({ ...s, error: err?.data?.error?.message || 'No se pudo registrar el movimiento' }));
    }
  };

  const columns = useMemo(() => [
    { key: 'creado_en', label: 'Fecha', width: 150, render: (m) => (
      <View>
        <Text className="text-sm">{fmtDate(m.creado_en)}</Text>
        <Text variant="caption" muted>{timeAgo(m.creado_en)}</Text>
      </View>
    ) },
    { key: 'tipo', label: 'Tipo', width: 100, render: (m) => <Badge tone={TIPO_TONE[m.tipo] || 'neutral'} label={m.tipo} /> },
    { key: 'producto_codigo', label: 'Producto', width: 130, render: (m) => <Text className="text-sm font-semibold">{m.producto_codigo}</Text> },
    { key: 'cantidad', label: 'Cant.', width: 70, align: 'center', render: (m) => <Text className="text-sm">{m.cantidad}</Text> },
    { key: 'stock', label: 'Stock', width: 110, align: 'center', render: (m) => (
      <Text className="text-sm" muted>{m.stock_anterior} → {m.stock_nuevo}</Text>
    ) },
    { key: 'motivo', label: 'Motivo', minWidth: 160, render: (m) => <Text className="text-sm" muted numberOfLines={1}>{m.motivo || '—'}</Text> },
    { key: 'referencia', label: 'Referencia', width: 120, render: (m) => <Text className="text-sm" muted>{m.referencia || '—'}</Text> },
    { key: 'usuario', label: 'Usuario', width: 140, render: (m) => <Text className="text-sm" muted>{m.usuario || 'Sistema'}</Text> },
  ], []);

  return (
    <View>
      <View className="mb-4 flex-row flex-wrap items-end justify-between gap-3">
        <View className="flex-1">
          <Text variant="h2" className="mb-1">Movimientos de stock</Text>
          <Text muted>Ingresos, egresos y ajustes</Text>
        </View>
        <Button icon="plus" label="Registrar movimiento" onPress={abrirNuevo} />
      </View>

      <Card className="mb-4">
        <View className="flex-row flex-wrap items-end gap-3">
          <View className="min-w-[200px] flex-1">
            <Select label="Tipo" value={filtros.tipo} options={tipoOptions} onChange={(v) => set({ tipo: v })} placeholder="Todos" />
          </View>
          <View className="min-w-[160px] flex-1"><FormField label="Desde" value={filtros.desde} onChangeText={(v) => set({ desde: v })} placeholder="AAAA-MM-DD" /></View>
          <View className="min-w-[160px] flex-1"><FormField label="Hasta" value={filtros.hasta} onChangeText={(v) => set({ hasta: v })} placeholder="AAAA-MM-DD" /></View>
        </View>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading || isFetching}
          emptyTitle="Sin movimientos"
          emptyMessage="Registrá el primer movimiento de stock."
        />
        <View className="px-3">
          <Pagination meta={meta} onPage={(p) => setFiltros((f) => ({ ...f, page: p }))} />
        </View>
      </Card>

      <ModalPopup
        visible={modal.visible}
        onClose={() => setModal((s) => ({ ...s, visible: false }))}
        title="Registrar movimiento"
        maxWidth={560}
        footer={
          <>
            <Button variant="secondary" label="Cancelar" onPress={() => setModal((s) => ({ ...s, visible: false }))} />
            <Button label="Registrar" loading={guardando} onPress={guardar} />
          </>
        }
      >
        <View>
          {/* Selector de producto */}
          <Text variant="label" className="mb-1.5">Producto <Text className="text-danger">*</Text></Text>
          {modal.producto ? (
            <View className="mb-3 flex-row items-center justify-between rounded-xl border border-brand-300 bg-brand-50 px-3 py-2.5 dark:border-brand-700 dark:bg-warm-800">
              <Text className="text-sm font-semibold">{modal.producto.codigo}</Text>
              <Pressable onPress={() => setModal((s) => ({ ...s, producto: null }))} hitSlop={8}>
                <Text variant="caption" className="text-danger">Cambiar</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <SearchBar
                value={modal.busq}
                onChangeText={(v) => setModal((s) => ({ ...s, busq: v }))}
                placeholder="Buscar producto por código (mín. 2 letras)"
              />
              {modal.busq.trim().length >= 2 ? (
                <View className="mt-2 rounded-xl border border-warm-200 dark:border-warm-700">
                  {buscandoProd ? (
                    <Text variant="caption" muted className="p-3">Buscando…</Text>
                  ) : resultados.length === 0 ? (
                    <Text variant="caption" muted className="p-3">Sin resultados</Text>
                  ) : (
                    resultados.map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => setModal((s) => ({ ...s, producto: p, busq: '' }))}
                        className="border-b border-warm-100 px-3 py-2.5 last:border-b-0 dark:border-warm-800"
                      >
                        <Text className="text-sm font-medium">{p.codigo}</Text>
                        <Text variant="caption" muted>Stock actual: {p.stock} · {p.categoria || 'sin categoría'}</Text>
                      </Pressable>
                    ))
                  )}
                </View>
              ) : null}
            </>
          )}

          <View className="mt-3">
            <Select label="Tipo de movimiento" value={modal.values.tipo} options={tipoFormOptions} onChange={setVal('tipo')} />
          </View>
          <FormField label="Cantidad" required value={modal.values.cantidad} onChangeText={setVal('cantidad')} keyboardType="numeric" placeholder="0" />
          <FormField label="Motivo" value={modal.values.motivo} onChangeText={setVal('motivo')} placeholder="Venta, compra, rotura..." />
          <FormField label="Referencia" value={modal.values.referencia} onChangeText={setVal('referencia')} placeholder="Nro de remito / venta" />

          {modal.error ? <Text variant="caption" className="text-danger">{modal.error}</Text> : null}
        </View>
      </ModalPopup>
    </View>
  );
}

export default MovimientosScreen;
