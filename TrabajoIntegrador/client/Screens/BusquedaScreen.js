/**
 * BusquedaScreen.js
 * Búsqueda avanzada de productos por medidas (con tolerancia), código, OEM
 * y texto de aplicación.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { FormField } from '../Components/molecules/FormField';
import { Pagination } from '../Components/molecules/Pagination';
import { EmptyState } from '../Components/molecules/EmptyState';
import { DataTable } from '../Components/organisms/DataTable';
import { useLazyBuscarProductosQuery } from '../Store/apiSlice';
import { formatCurrency, formatNumber } from '../Utils/format';

const vacio = { codigo: '', eje: '', aloj: '', alt: '', tolerancia: '0.5', oem: '', texto: '' };

export function BusquedaScreen() {
  const [form, setForm] = useState(vacio);
  const [page, setPage] = useState(1);
  const [trigger, { data, isFetching }] = useLazyBuscarProductosQuery();

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const buscar = (pageNum = 1) => {
    setPage(pageNum);
    const params = {
      page: pageNum,
      limit: 15,
      codigo: form.codigo.trim() || undefined,
      eje: form.eje !== '' ? Number(form.eje) : undefined,
      aloj: form.aloj !== '' ? Number(form.aloj) : undefined,
      alt: form.alt !== '' ? Number(form.alt) : undefined,
      tolerancia: form.tolerancia !== '' ? Number(form.tolerancia) : undefined,
      oem: form.oem.trim() || undefined,
      texto: form.texto.trim() || undefined,
    };
    trigger(params);
  };

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;
  const yaBusco = !!data;

  const columns = useMemo(() => [
    { key: 'codigo', label: 'Código', width: 130, render: (p) => <Text className="text-sm font-semibold">{p.codigo}</Text> },
    { key: 'categoria', label: 'Categoría', width: 140, render: (p) => <Text className="text-sm" muted>{p.categoria || '—'}</Text> },
    { key: 'eje_texto', label: 'Eje', width: 80, align: 'center', render: (p) => <Text className="text-sm">{p.eje_texto || '—'}</Text> },
    { key: 'aloj_texto', label: 'Aloj', width: 80, align: 'center', render: (p) => <Text className="text-sm">{p.aloj_texto || '—'}</Text> },
    { key: 'alt_texto', label: 'Alt', width: 80, align: 'center', render: (p) => <Text className="text-sm">{p.alt_texto || '—'}</Text> },
    { key: 'giro', label: 'Giro', width: 80, render: (p) => <Text className="text-sm" muted>{p.giro || '—'}</Text> },
    { key: 'stock', label: 'Stock', width: 80, align: 'center', render: (p) => <Text className="text-sm">{formatNumber(p.stock)}</Text> },
    { key: 'precio_lista', label: 'Precio', width: 120, align: 'right', render: (p) => <Text className="text-sm">{formatCurrency(p.precio_lista)}</Text> },
  ], []);

  return (
    <View>
      <Text variant="h2" className="mb-1">Búsqueda por medidas</Text>
      <Text muted className="mb-4">Combiná medidas con tolerancia en milímetros</Text>

      <Card className="mb-4">
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[160px] flex-1"><FormField label="Código" value={form.codigo} onChangeText={set('codigo')} placeholder="EMIC / interno" /></View>
          <View className="min-w-[110px] flex-1"><FormField label="Eje (mm)" value={form.eje} onChangeText={set('eje')} keyboardType="numeric" placeholder="57" /></View>
          <View className="min-w-[110px] flex-1"><FormField label="Aloj (mm)" value={form.aloj} onChangeText={set('aloj')} keyboardType="numeric" placeholder="32" /></View>
          <View className="min-w-[110px] flex-1"><FormField label="Alt (mm)" value={form.alt} onChangeText={set('alt')} keyboardType="numeric" placeholder="10" /></View>
          <View className="min-w-[120px] flex-1"><FormField label="Tolerancia (±)" value={form.tolerancia} onChangeText={set('tolerancia')} keyboardType="numeric" help="Por defecto 0.5" /></View>
        </View>
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[200px] flex-1"><FormField label="Código OEM" value={form.oem} onChangeText={set('oem')} placeholder="90311-32001" /></View>
          <View className="min-w-[260px] flex-[2]"><FormField label="Texto / aplicación" value={form.texto} onChangeText={set('texto')} placeholder="Toyota Corolla 1.8" /></View>
        </View>

        <View className="mt-1 flex-row gap-2">
          <Button icon="search" label="Buscar" onPress={() => buscar(1)} loading={isFetching} />
          <Button variant="secondary" label="Limpiar" onPress={() => { setForm(vacio); trigger({ page: 1, limit: 15 }, false); }} />
        </View>
      </Card>

      {yaBusco ? (
        <Card padded={false} className="overflow-hidden">
          <DataTable
            columns={columns}
            data={items}
            loading={isFetching}
            emptyTitle="Sin coincidencias"
            emptyMessage="Probá ampliar la tolerancia o quitar filtros."
          />
          <View className="px-3">
            <Pagination meta={meta} onPage={(p) => buscar(p)} />
          </View>
        </Card>
      ) : (
        <EmptyState icon="search" title="Ingresá criterios de búsqueda" message="Los resultados aparecerán acá." />
      )}
    </View>
  );
}

export default BusquedaScreen;
