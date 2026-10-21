/**
 * DashboardScreen.js
 * Panel principal con KPIs, gráfico por categoría y últimos movimientos.
 */
import { View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Badge } from '../Components/atoms/Badge';
import { Row, Col } from '../Components/atoms/Grid';
import { KpiCard } from '../Components/molecules/KpiCard';
import { BarChart } from '../Components/molecules/BarChart';
import { EmptyState } from '../Components/molecules/EmptyState';
import { useGetDashboardQuery, useGetUltimosMovimientosQuery } from '../Store/apiSlice';
import { formatCurrency, formatNumber, timeAgo } from '../Utils/format';

const TIPO_TONE = { INGRESO: 'success', EGRESO: 'danger', AJUSTE: 'warning' };

export function DashboardScreen() {
  const { data, isLoading, isError, error } = useGetDashboardQuery();
  const { data: movData } = useGetUltimosMovimientosQuery(6);

  const kpi = data?.data;
  const movimientos = movData?.data ?? [];
  const porCategoria = kpi?.porCategoria ?? [];

  if (isError) {
    return (
      <EmptyState
        icon="alert"
        title="No se pudieron cargar los indicadores"
        message={error?.data?.error?.message || 'Verificá la conexión con el servidor.'}
      />
    );
  }

  return (
    <View>
      <Text variant="h2" className="mb-1">Resumen general</Text>
      <Text muted className="mb-4">Estado actual del depósito</Text>

      {/* KPIs principales */}
      <View className="mb-4 flex-row flex-wrap gap-3">
        <KpiCard
          className="min-w-[220px]"
          label="Productos"
          value={isLoading ? '—' : formatNumber(kpi?.totalProductos)}
          icon="productos"
          tone="brand"
          hint={`${formatNumber(kpi?.productosActivos)} activos`}
        />
        <KpiCard
          className="min-w-[220px]"
          label="Valor del stock"
          value={isLoading ? '—' : formatCurrency(kpi?.valorStock)}
          icon="precios"
          tone="success"
          hint={`${formatNumber(kpi?.unidadesTotales)} unidades`}
        />
        <KpiCard
          className="min-w-[220px]"
          label="Stock bajo"
          value={isLoading ? '—' : formatNumber(kpi?.productosStockBajo)}
          icon="alert"
          tone={kpi?.productosStockBajo > 0 ? 'danger' : 'success'}
          hint="Bajo el mínimo definido"
        />
        <KpiCard
          className="min-w-[220px]"
          label="Próximo ingreso"
          value={isLoading ? '—' : formatNumber(kpi?.productosProximoIngreso)}
          icon="upload"
          tone="info"
          hint={`${formatNumber(kpi?.alertasPendientes)} alertas pendientes`}
        />
      </View>

      <Row gutter={16}>
        {/* Últimos movimientos */}
        <Col xs={12} lg={6}>
          <Card className="h-full">
            <Text variant="h3" className="mb-3">Últimos movimientos</Text>
            {movimientos.length === 0 ? (
              <EmptyState icon="movimientos" title="Sin movimientos" message="Todavía no se registraron movimientos." />
            ) : (
              movimientos.map((m) => (
                <View
                  key={m.id}
                  className="mb-2 flex-row items-center justify-between border-b border-warm-100 pb-2 dark:border-warm-800"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-semibold">{m.producto_codigo}</Text>
                    <Text variant="caption" muted>{m.usuario || 'Sistema'} · {timeAgo(m.creado_en)}</Text>
                  </View>
                  <View className="items-end">
                    <Badge tone={TIPO_TONE[m.tipo] || 'neutral'} label={m.tipo} />
                    <Text variant="caption" muted className="mt-1">
                      {m.stock_anterior} → {m.stock_nuevo}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </Col>

        {/* Resumen por categoría */}
        <Col xs={12} lg={6}>
          <Card className="h-full">
            <Text variant="h3" className="mb-3">Resumen por categoría</Text>
            {porCategoria.length === 0 ? (
              <EmptyState icon="reportes" title="Sin datos" />
            ) : (
              porCategoria.map((c) => (
                <View
                  key={c.categoria}
                  className="mb-2 flex-row items-center justify-between border-b border-warm-100 pb-2 dark:border-warm-800"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-medium">{c.categoria}</Text>
                    <Text variant="caption" muted>{formatNumber(c.productos)} productos · {formatNumber(c.unidades)} u.</Text>
                  </View>
                  <Text className="text-sm font-semibold">{formatCurrency(c.valor)}</Text>
                </View>
              ))
            )}
          </Card>
        </Col>
      </Row>

      {/* Gráfico: unidades por categoría */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={12}>
          <Card>
            <Text variant="h3" className="mb-3">Unidades por categoría</Text>
            {porCategoria.length === 0 ? (
              <EmptyState icon="reportes" title="Sin datos" />
            ) : (
              <BarChart
                data={porCategoria.map((c) => ({ label: c.categoria, value: Number(c.unidades) || 0 }))}
                formatValue={formatNumber}
              />
            )}
          </Card>
        </Col>
      </Row>
    </View>
  );
}

export default DashboardScreen;
