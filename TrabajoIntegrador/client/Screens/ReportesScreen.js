/**
 * ReportesScreen.js
 * Reportes de stock, movimientos y valorización, con exportación a CSV.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { Badge } from '../Components/atoms/Badge';
import { Switch } from '../Components/atoms/Switch';
import { Select } from '../Components/molecules/Select';
import { FormField } from '../Components/molecules/FormField';
import { KpiCard } from '../Components/molecules/KpiCard';
import { DataTable } from '../Components/organisms/DataTable';
import { useFeedback } from '../Components/organisms/FeedbackProvider';
import {
  useGetReporteStockQuery, useGetReporteMovimientosQuery, useGetReporteValorQuery, useGetCategoriasQuery,
} from '../Store/apiSlice';
import { descargarCsv } from '../Services/export';
import { formatCurrency, formatNumber, formatDate as fmtDate } from '../Utils/format';

const tipos = [
  { label: 'Todos', value: null },
  { label: 'Ingreso', value: 'INGRESO' },
  { label: 'Egreso', value: 'EGRESO' },
  { label: 'Ajuste', value: 'AJUSTE' },
];
const TIPO_TONE = { INGRESO: 'success', EGRESO: 'danger', AJUSTE: 'warning' };

export function ReportesScreen() {
  const { toast } = useFeedback();
  const [tab, setTab] = useState('stock');
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [categoriaId, setCategoriaId] = useState(null);
  const [mov, setMov] = useState({ desde: '', hasta: '', tipo: null });

  const { data: catData } = useGetCategoriasQuery();
  const categorias = catData?.data ?? [];

  const stockQ = useGetReporteStockQuery(
    { categoriaId: categoriaId || undefined, soloStockBajo: soloStockBajo || undefined },
    { skip: tab !== 'stock' },
  );
  const movQ = useGetReporteMovimientosQuery(
    { desde: mov.desde || undefined, hasta: mov.hasta || undefined, tipo: mov.tipo || undefined },
    { skip: tab !== 'movimientos' },
  );
  const valorQ = useGetReporteValorQuery(undefined, { skip: tab !== 'valor' });

  const stock = stockQ.data?.data ?? [];
  const movimientos = movQ.data?.data ?? [];
  const valor = valorQ.data?.data;

  const exportar = async (tipo) => {
    try {
      const qs = tipo === 'stock'
        ? [categoriaId ? `categoriaId=${categoriaId}` : '', soloStockBajo ? 'soloStockBajo=1' : ''].filter(Boolean).join('&')
        : [mov.desde ? `desde=${mov.desde}` : '', mov.hasta ? `hasta=${mov.hasta}` : '', mov.tipo ? `tipo=${mov.tipo}` : ''].filter(Boolean).join('&');
      const path = `/reportes/${tipo}/export${qs ? `?${qs}` : ''}`;
      const res = await descargarCsv(path, `reporte_${tipo}.csv`);
      toast({
        message: res === 'web' ? 'Descarga iniciada' : 'En dispositivos móviles, exportá desde la versión web.',
        tone: res === 'web' ? 'success' : 'info',
      });
    } catch (err) {
      toast({ message: err?.message || 'No se pudo exportar', tone: 'error' });
    }
  };

  const colStock = useMemo(() => [
    { key: 'codigo', label: 'Código', width: 130, render: (p) => <Text className="text-sm font-semibold">{p.codigo}</Text> },
    { key: 'categoria', label: 'Categoría', width: 150, render: (p) => <Text className="text-sm" muted>{p.categoria || '—'}</Text> },
    { key: 'medidas', label: 'Medidas', width: 170, render: (p) => <Text className="text-sm" muted>{[p.eje_texto, p.aloj_texto, p.alt_texto].filter(Boolean).join(' / ') || '—'}</Text> },
    { key: 'stock', label: 'Stock', width: 90, align: 'center', render: (p) => <Badge tone={p.stock_bajo ? 'danger' : 'success'} label={formatNumber(p.stock)} /> },
    { key: 'stock_minimo', label: 'Mínimo', width: 90, align: 'center', render: (p) => <Text className="text-sm" muted>{p.stock_minimo}</Text> },
    { key: 'precio_lista', label: 'Precio', width: 120, align: 'right', render: (p) => <Text className="text-sm">{formatCurrency(p.precio_lista)}</Text> },
    { key: 'valor_stock', label: 'Valor', width: 130, align: 'right', render: (p) => <Text className="text-sm font-semibold">{formatCurrency(p.valor_stock)}</Text> },
  ], []);

  const colMov = useMemo(() => [
    { key: 'creado_en', label: 'Fecha', width: 160, render: (m) => <Text className="text-sm">{fmtDate(m.creado_en, { conHora: true })}</Text> },
    { key: 'tipo', label: 'Tipo', width: 100, render: (m) => <Badge tone={TIPO_TONE[m.tipo] || 'neutral'} label={m.tipo} /> },
    { key: 'producto_codigo', label: 'Producto', width: 130, render: (m) => <Text className="text-sm font-semibold">{m.producto_codigo}</Text> },
    { key: 'cantidad', label: 'Cant.', width: 70, align: 'center', render: (m) => <Text className="text-sm">{m.cantidad}</Text> },
    { key: 'stock', label: 'Stock', width: 110, align: 'center', render: (m) => <Text className="text-sm" muted>{m.stock_anterior} → {m.stock_nuevo}</Text> },
    { key: 'motivo', label: 'Motivo', minWidth: 160, render: (m) => <Text className="text-sm" muted numberOfLines={1}>{m.motivo || '—'}</Text> },
    { key: 'usuario', label: 'Usuario', width: 150, render: (m) => <Text className="text-sm" muted>{m.usuario || 'Sistema'}</Text> },
  ], []);

  const Tab = ({ id, label }) => (
    <Button
      variant={tab === id ? 'primary' : 'secondary'}
      size="sm"
      label={label}
      onPress={() => setTab(id)}
    />
  );

  return (
    <View>
      <Text variant="h2" className="mb-1">Reportes</Text>
      <Text muted className="mb-4">Explorá y exportá la información del depósito</Text>

      <View className="mb-4 flex-row flex-wrap gap-2">
        <Tab id="stock" label="Stock" />
        <Tab id="movimientos" label="Movimientos" />
        <Tab id="valor" label="Valorización" />
      </View>

      {tab === 'stock' ? (
        <>
          <Card className="mb-4">
            <View className="flex-row flex-wrap items-end gap-3">
              <View className="min-w-[220px] flex-1">
                <Select
                  label="Categoría"
                  value={categoriaId}
                  options={[{ label: 'Todas', value: null }, ...categorias.map((c) => ({ label: c.nombre, value: c.id }))]}
                  onChange={setCategoriaId}
                />
              </View>
              <Switch label="Solo stock bajo" value={soloStockBajo} onValueChange={setSoloStockBajo} className="mb-1 min-w-[180px]" />
              <Button icon="download" label="Exportar CSV" onPress={() => exportar('stock')} />
            </View>
          </Card>
          <Card padded={false} className="overflow-hidden">
            <DataTable columns={colStock} data={stock} loading={stockQ.isFetching} emptyTitle="Sin datos de stock" />
          </Card>
        </>
      ) : null}

      {tab === 'movimientos' ? (
        <>
          <Card className="mb-4">
            <View className="flex-row flex-wrap items-end gap-3">
              <View className="min-w-[160px] flex-1"><FormField label="Desde" value={mov.desde} onChangeText={(v) => setMov((s) => ({ ...s, desde: v }))} placeholder="AAAA-MM-DD" /></View>
              <View className="min-w-[160px] flex-1"><FormField label="Hasta" value={mov.hasta} onChangeText={(v) => setMov((s) => ({ ...s, hasta: v }))} placeholder="AAAA-MM-DD" /></View>
              <View className="min-w-[180px] flex-1"><Select label="Tipo" value={mov.tipo} options={tipos} onChange={(v) => setMov((s) => ({ ...s, tipo: v }))} placeholder="Todos" /></View>
              <Button icon="download" label="Exportar CSV" onPress={() => exportar('movimientos')} />
            </View>
          </Card>
          <Card padded={false} className="overflow-hidden">
            <DataTable columns={colMov} data={movimientos} loading={movQ.isFetching} emptyTitle="Sin movimientos en el rango" />
          </Card>
        </>
      ) : null}

      {tab === 'valor' ? (
        <>
          <View className="mb-4 flex-row flex-wrap gap-3">
            <KpiCard className="min-w-[220px]" label="Productos" value={formatNumber(valor?.total_productos)} icon="productos" tone="brand" />
            <KpiCard className="min-w-[220px]" label="Unidades" value={formatNumber(valor?.unidades_totales)} icon="reportes" tone="info" />
            <KpiCard className="min-w-[240px]" label="Valor total" value={formatCurrency(valor?.valor_total_stock)} icon="precios" tone="success" />
            <KpiCard className="min-w-[220px]" label="Stock bajo" value={formatNumber(valor?.productos_stock_bajo)} icon="alert" tone={valor?.productos_stock_bajo > 0 ? 'danger' : 'success'} />
          </View>
          <Card padded={false} className="overflow-hidden">
            <View className="p-4 pb-2"><Text variant="h3">Valor por categoría</Text></View>
            <DataTable
              columns={[
                { key: 'categoria', label: 'Categoría', minWidth: 200, render: (c) => <Text className="text-sm font-medium">{c.categoria}</Text> },
                { key: 'productos', label: 'Productos', width: 120, align: 'center', render: (c) => <Text className="text-sm">{formatNumber(c.productos)}</Text> },
                { key: 'unidades', label: 'Unidades', width: 120, align: 'center', render: (c) => <Text className="text-sm">{formatNumber(c.unidades)}</Text> },
                { key: 'valor', label: 'Valor', width: 160, align: 'right', render: (c) => <Text className="text-sm font-semibold">{formatCurrency(c.valor)}</Text> },
              ]}
              data={valor?.porCategoria ?? []}
              loading={valorQ.isFetching}
              emptyTitle="Sin datos"
            />
          </Card>
        </>
      ) : null}
    </View>
  );
}

export default ReportesScreen;
