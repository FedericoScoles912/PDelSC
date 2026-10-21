/**
 * PreciosScreen.js
 * Consulta de productos, actualización de precio de lista e historial de cambios.
 */
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { Badge } from '../Components/atoms/Badge';
import { Switch } from '../Components/atoms/Switch';
import { FormField } from '../Components/molecules/FormField';
import { SearchBar } from '../Components/molecules/SearchBar';
import { Pagination } from '../Components/molecules/Pagination';
import { EmptyState } from '../Components/molecules/EmptyState';
import { DataTable } from '../Components/organisms/DataTable';
import { useFeedback } from '../Components/organisms/FeedbackProvider';
import {
  useGetProductosQuery, useGetPrecioHistorialQuery, useActualizarPrecioMutation,
} from '../Store/apiSlice';
import { formatCurrency, formatDate as fmtDate } from '../Utils/format';

export function PreciosScreen() {
  const { toast } = useFeedback();
  const [busq, setBusq] = useState('');
  const [producto, setProducto] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ precioLista: '', proximoIngreso: false, error: '' });

  const { data: prodData, isFetching: buscando } = useGetProductosQuery(
    { codigo: busq, limit: 8 },
    { skip: busq.trim().length < 2 || !!producto },
  );
  const { data: histData, isFetching: cargandoHist } = useGetPrecioHistorialQuery(
    { id: producto?.id, page, limit: 10 },
    { skip: !producto },
  );
  const [actualizar, { isLoading: guardando }] = useActualizarPrecioMutation();

  const resultados = prodData?.data?.items ?? [];
  const historial = histData?.data?.items ?? [];
  const meta = histData?.data?.meta;

  const seleccionar = (p) => {
    setProducto(p);
    setBusq('');
    setPage(1);
    setForm({
      precioLista: p.precio_lista != null ? String(p.precio_lista) : '',
      proximoIngreso: !!p.proximo_ingreso,
      error: '',
    });
  };

  const guardar = async () => {
    const precio = Number(form.precioLista);
    if (!form.precioLista || Number.isNaN(precio) || precio < 0) {
      setForm((s) => ({ ...s, error: 'Ingresá un precio válido' }));
      return;
    }
    try {
      const res = await actualizar({ id: producto.id, precioLista: precio, proximoIngreso: !!form.proximoIngreso }).unwrap();
      const nuevo = res.data;
      setProducto((p) => ({ ...p, precio_lista: nuevo.precio_lista, proximo_ingreso: nuevo.proximo_ingreso }));
      toast({ message: 'Precio actualizado', tone: 'success' });
      setForm((s) => ({ ...s, error: '' }));
    } catch (err) {
      setForm((s) => ({ ...s, error: err?.data?.error?.message || 'No se pudo actualizar el precio' }));
    }
  };

  const columns = useMemo(() => [
    { key: 'creado_en', label: 'Fecha', width: 160, render: (h) => <Text className="text-sm">{fmtDate(h.creado_en, { conHora: true })}</Text> },
    { key: 'precio_anterior', label: 'Anterior', width: 130, align: 'right', render: (h) => <Text className="text-sm" muted>{formatCurrency(h.precio_anterior)}</Text> },
    { key: 'precio_nuevo', label: 'Nuevo', width: 130, align: 'right', render: (h) => <Text className="text-sm font-semibold">{formatCurrency(h.precio_nuevo)}</Text> },
    { key: 'origen', label: 'Origen', width: 130, render: (h) => <Badge tone={h.origen === 'IMPORTACION' ? 'info' : 'neutral'} label={h.origen === 'IMPORTACION' ? 'Importación' : 'Manual'} /> },
    { key: 'usuario', label: 'Usuario', width: 160, render: (h) => <Text className="text-sm" muted>{h.usuario || 'Sistema'}</Text> },
  ], []);

  return (
    <View>
      <Text variant="h2" className="mb-1">Gestión de precios</Text>
      <Text muted className="mb-4">Actualizá el precio de lista y consultá su historial</Text>

      <Card className="mb-4">
        <Text variant="label" className="mb-1.5">Seleccionar producto</Text>
        {producto ? (
          <View className="flex-row items-center justify-between rounded-xl border border-brand-300 bg-brand-50 px-3 py-2.5 dark:border-brand-700 dark:bg-warm-800">
            <View className="flex-1">
              <Text className="text-sm font-semibold">{producto.codigo}</Text>
              <Text variant="caption" muted>{producto.categoria || 'Sin categoría'} · stock {producto.stock}</Text>
            </View>
            <Pressable onPress={() => { setProducto(null); setBusq(''); }} hitSlop={8}>
              <Text variant="caption" className="text-danger">Cambiar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <SearchBar value={busq} onChangeText={setBusq} placeholder="Buscar por código (mín. 2 letras)" />
            {busq.trim().length >= 2 ? (
              <View className="mt-2 rounded-xl border border-warm-200 dark:border-warm-700">
                {buscando ? (
                  <Text variant="caption" muted className="p-3">Buscando…</Text>
                ) : resultados.length === 0 ? (
                  <Text variant="caption" muted className="p-3">Sin resultados</Text>
                ) : (
                  resultados.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => seleccionar(p)}
                      className="border-b border-warm-100 px-3 py-2.5 last:border-b-0 dark:border-warm-800"
                    >
                      <Text className="text-sm font-medium">{p.codigo}</Text>
                      <Text variant="caption" muted>{formatCurrency(p.precio_lista)} · {p.categoria || 'sin categoría'}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}
          </>
        )}
      </Card>

      {producto ? (
        <View className="flex-row flex-wrap gap-4">
          {/* Actualización */}
          <Card className="min-w-[300px] flex-1">
            <Text variant="h3" className="mb-3">Actualizar precio</Text>
            <Text muted className="mb-3">Precio actual: {formatCurrency(producto.precio_lista)}</Text>
            <FormField
              label="Nuevo precio de lista"
              value={form.precioLista}
              onChangeText={(v) => setForm((s) => ({ ...s, precioLista: v }))}
              keyboardType="numeric"
              placeholder="0.00"
            />
            <Switch
              label="Marcar como próximo ingreso"
              value={form.proximoIngreso}
              onValueChange={(v) => setForm((s) => ({ ...s, proximoIngreso: v }))}
            />
            {form.error ? <Text variant="caption" className="mb-2 text-danger">{form.error}</Text> : null}
            <Button label="Guardar precio" loading={guardando} onPress={guardar} fullWidth />
          </Card>

          {/* Historial */}
          <Card className="min-w-[380px] flex-[2]" padded={false}>
            <View className="p-4 pb-2"><Text variant="h3">Historial de cambios</Text></View>
            <DataTable
              columns={columns}
              data={historial}
              loading={cargandoHist}
              emptyTitle="Sin cambios registrados"
              emptyMessage="Todavía no hay variaciones de precio para este producto."
            />
            <View className="px-3">
              <Pagination meta={meta} onPage={setPage} />
            </View>
          </Card>
        </View>
      ) : (
        <EmptyState icon="precios" title="Seleccioná un producto" message="Buscá por código para ver y editar su precio." />
      )}
    </View>
  );
}

export default PreciosScreen;
