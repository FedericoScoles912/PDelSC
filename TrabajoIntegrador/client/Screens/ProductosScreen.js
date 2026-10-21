/**
 * ProductosScreen.js
 * ABML de productos con filtros, paginación, stock mínimo y equivalencias.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { Badge } from '../Components/atoms/Badge';
import { IconButton } from '../Components/atoms/IconButton';
import { Switch } from '../Components/atoms/Switch';
import { FormField } from '../Components/molecules/FormField';
import { SearchBar } from '../Components/molecules/SearchBar';
import { Select } from '../Components/molecules/Select';
import { Pagination } from '../Components/molecules/Pagination';
import { ModalPopup } from '../Components/molecules/ModalPopup';
import { DataTable } from '../Components/organisms/DataTable';
import { useFeedback } from '../Components/organisms/FeedbackProvider';
import {
  useGetProductosQuery, useGetCategoriasQuery,
  useCrearProductoMutation, useActualizarProductoMutation,
  useEliminarProductoMutation, useSetStockMinimoMutation,
} from '../Store/apiSlice';
import { formatCurrency, formatNumber } from '../Utils/format';
import { hasRole, EDITORES, ROLES } from '../Utils/roles';

const giroOptions = [
  { label: 'H', value: 'H' },
  { label: 'AH', value: 'AH' },
  { label: 'LI', value: 'LI' },
  { label: 'LISO', value: 'LISO' },
  { label: 'BI DIR', value: 'BI DIR' },
];

const num = (v) => (v === '' || v === undefined || v === null ? null : Number(v));
const vacio = { codigo: '', categoriaId: null, lanzamiento: '', ejeTexto: '', alojTexto: '', altTexto: '', giro: null, uxb: '', observaciones: '', precioLista: '', stockMinimo: '0', stockInicial: '0', proximoIngreso: false, activo: true, equivalencias: '' };

export function ProductosScreen() {
  const usuario = useSelector((s) => s.auth.usuario);
  const { toast, dialog } = useFeedback();
  const puedeEditar = hasRole(usuario, EDITORES);
  const esAdmin = hasRole(usuario, [ROLES.ADMIN]);

  const [filtros, setFiltros] = useState({ page: 1, limit: 15, codigo: '', categoriaId: null, stockBajo: false });
  const [form, setForm] = useState({ visible: false, mode: 'create', values: vacio, error: '' });
  const [stockModal, setStockModal] = useState({ visible: false, producto: null, valor: '0' });

  const { data, isLoading, isFetching } = useGetProductosQuery({
    page: filtros.page,
    limit: filtros.limit,
    codigo: filtros.codigo || undefined,
    categoriaId: filtros.categoriaId || undefined,
    stockBajo: filtros.stockBajo || undefined,
  });
  const { data: catData } = useGetCategoriasQuery();

  const [crear, { isLoading: creando }] = useCrearProductoMutation();
  const [actualizar, { isLoading: actualizando }] = useActualizarProductoMutation();
  const [eliminar] = useEliminarProductoMutation();
  const [setMinimo] = useSetStockMinimoMutation();

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;
  const categorias = catData?.data ?? [];
  const categoriaOptions = [{ label: 'Todas las categorías', value: null }, ...categorias.map((c) => ({ label: c.nombre, value: c.id }))];

  const set = (patch) => setFiltros((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  const setField = (k) => (v) => setForm((s) => ({ ...s, values: { ...s.values, [k]: v } }));

  const abrirNuevo = () => setForm({ visible: true, mode: 'create', values: { ...vacio }, error: '' });

  const abrirEditar = (p) => setForm({
    visible: true,
    mode: 'edit',
    error: '',
    values: {
      ...vacio,
      id: p.id,
      codigo: p.codigo ?? '',
      categoriaId: p.categoria_id ?? null,
      lanzamiento: p.lanzamiento ?? '',
      ejeTexto: p.eje_texto ?? '',
      alojTexto: p.aloj_texto ?? '',
      altTexto: p.alt_texto ?? '',
      giro: p.giro ?? null,
      uxb: p.uxb != null ? String(p.uxb) : '',
      observaciones: p.observaciones ?? '',
      precioLista: p.precio_lista != null ? String(p.precio_lista) : '',
      stockMinimo: String(p.stock_minimo ?? 0),
      proximoIngreso: !!p.proximo_ingreso,
      activo: !!p.activo,
      equivalencias: '',
    },
  });

  const guardar = async () => {
    const v = form.values;
    if (!v.codigo.trim()) {
      setForm((s) => ({ ...s, error: 'El código es obligatorio' }));
      return;
    }

    const equivalencias = v.equivalencias
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((codigo) => ({ tipo: 'OEM', codigo }));

    const payload = {
      codigo: v.codigo.trim(),
      categoriaId: v.categoriaId ?? null,
      lanzamiento: v.lanzamiento?.trim() || null,
      ejeTexto: v.ejeTexto?.trim() || null,
      alojTexto: v.alojTexto?.trim() || null,
      altTexto: v.altTexto?.trim() || null,
      giro: v.giro ?? null,
      uxb: num(v.uxb),
      observaciones: v.observaciones?.trim() || null,
      precioLista: num(v.precioLista),
      stockMinimo: num(v.stockMinimo) ?? 0,
      proximoIngreso: !!v.proximoIngreso,
      activo: !!v.activo,
    };
    if (equivalencias.length) payload.equivalencias = equivalencias;

    try {
      if (form.mode === 'create') {
        await crear({ ...payload, stockInicial: num(v.stockInicial) ?? 0 }).unwrap();
        toast({ message: 'Producto creado', tone: 'success' });
      } else {
        await actualizar({ id: v.id, ...payload }).unwrap();
        toast({ message: 'Producto actualizado', tone: 'success' });
      }
      setForm({ visible: false, mode: 'create', values: vacio, error: '' });
    } catch (err) {
      setForm((s) => ({ ...s, error: err?.data?.error?.message || 'No se pudo guardar' }));
    }
  };

  const confirmarEliminar = async (p) => {
    const ok = await dialog({
      title: 'Eliminar producto',
      message: `¿Eliminar el producto ${p.codigo}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      tone: 'error',
    });
    if (!ok) return;
    try {
      await eliminar(p.id).unwrap();
      toast({ message: 'Producto eliminado', tone: 'success' });
    } catch (err) {
      toast({ message: err?.data?.error?.message || 'No se pudo eliminar', tone: 'error' });
    }
  };

  const abrirStock = (p) => setStockModal({ visible: true, producto: p, valor: String(p.stock_minimo ?? 0) });

  const guardarStock = async () => {
    try {
      await setMinimo({ id: stockModal.producto.id, stockMinimo: Number(stockModal.valor) || 0 }).unwrap();
      toast({ message: 'Stock mínimo actualizado', tone: 'success' });
      setStockModal({ visible: false, producto: null, valor: '0' });
    } catch (err) {
      toast({ message: err?.data?.error?.message || 'No se pudo actualizar', tone: 'error' });
    }
  };

  const columns = useMemo(() => [
    { key: 'codigo', label: 'Código', width: 130, render: (p) => <Text className="text-sm font-semibold">{p.codigo}</Text> },
    { key: 'categoria', label: 'Categoría', width: 150, render: (p) => <Text className="text-sm" muted>{p.categoria || '—'}</Text> },
    { key: 'medidas', label: 'Medidas (E/A/AL)', width: 190, render: (p) => (
      <Text className="text-sm" muted>
        {[p.eje_texto, p.aloj_texto, p.alt_texto].filter(Boolean).join(' / ') || '—'}
      </Text>
    ) },
    { key: 'giro', label: 'Giro', width: 80, render: (p) => <Text className="text-sm" muted>{p.giro || '—'}</Text> },
    { key: 'stock', label: 'Stock', width: 90, align: 'center', render: (p) => (
      <Badge tone={p.stock <= p.stock_minimo ? 'danger' : 'success'} label={formatNumber(p.stock)} />
    ) },
    { key: 'precio_lista', label: 'Precio', width: 130, align: 'right', render: (p) => (
      p.proximo_ingreso ? <Badge tone="warning" label="Próximo ingreso" /> : <Text className="text-sm">{formatCurrency(p.precio_lista)}</Text>
    ) },
  ], []);

  return (
    <View>
      <View className="mb-4 flex-row flex-wrap items-end justify-between gap-3">
        <View className="flex-1">
          <Text variant="h2" className="mb-1">Productos</Text>
          <Text muted>Catálogo de retenes y sellos</Text>
        </View>
        {puedeEditar ? <Button icon="plus" label="Nuevo producto" onPress={abrirNuevo} /> : null}
      </View>

      {/* Filtros */}
      <Card className="mb-4">
        <View className="flex-row flex-wrap items-end gap-3">
          <View className="min-w-[220px] flex-1">
            <SearchBar
              value={filtros.codigo}
              onChangeText={(v) => set({ codigo: v })}
              placeholder="Buscar por código..."
            />
          </View>
          <View className="min-w-[220px] flex-1">
            <Select
              value={filtros.categoriaId}
              options={categoriaOptions}
              onChange={(v) => set({ categoriaId: v })}
              placeholder="Todas las categorías"
            />
          </View>
          <Button
            variant={filtros.stockBajo ? 'danger' : 'secondary'}
            icon="alert"
            label="Solo stock bajo"
            onPress={() => set({ stockBajo: !filtros.stockBajo })}
          />
        </View>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading || isFetching}
          emptyTitle="Sin productos"
          emptyMessage="Ajustá los filtros o cargá productos desde Excel."
          actionsWidth={puedeEditar ? 120 : 60}
          renderActions={(p) => (
            <View className="flex-row justify-end gap-2">
              {puedeEditar ? (
                <>
                  <IconButton name="edit" size={30} onPress={() => abrirEditar(p)} />
                  <IconButton name="alert" size={30} onPress={() => abrirStock(p)} />
                </>
              ) : null}
              {esAdmin ? <IconButton name="trash" size={30} variant="danger" onPress={() => confirmarEliminar(p)} /> : null}
            </View>
          )}
        />
        <View className="px-3">
          <Pagination meta={meta} onPage={(p) => setFiltros((f) => ({ ...f, page: p }))} />
        </View>
      </Card>

      {/* Formulario alta/edición */}
      <ModalPopup
        visible={form.visible}
        onClose={() => setForm((s) => ({ ...s, visible: false }))}
        title={form.mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
        maxWidth={720}
        footer={
          <>
            <Button variant="secondary" label="Cancelar" onPress={() => setForm((s) => ({ ...s, visible: false }))} />
            <Button label="Guardar" loading={creando || actualizando} onPress={guardar} />
          </>
        }
      >
        <View>
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[200px] flex-1">
              <FormField label="Código" required value={form.values.codigo} onChangeText={setField('codigo')} placeholder="Ej: 4015300" />
            </View>
            <View className="min-w-[200px] flex-1">
              <Select
                label="Categoría"
                value={form.values.categoriaId}
                options={[{ label: 'Sin categoría', value: null }, ...categorias.map((c) => ({ label: c.nombre, value: c.id }))]}
                onChange={setField('categoriaId')}
              />
            </View>
          </View>

          <FormField label="Lanzamiento" value={form.values.lanzamiento} onChangeText={setField('lanzamiento')} placeholder="IDEM: 4015300 / LANZAMIENTO" />

          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[140px] flex-1"><FormField label="Eje (texto)" value={form.values.ejeTexto} onChangeText={setField('ejeTexto')} placeholder="57" /></View>
            <View className="min-w-[140px] flex-1"><FormField label="Aloj (texto)" value={form.values.alojTexto} onChangeText={setField('alojTexto')} placeholder="32" /></View>
            <View className="min-w-[140px] flex-1"><FormField label="Alt (texto)" value={form.values.altTexto} onChangeText={setField('altTexto')} placeholder="10" /></View>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[160px] flex-1">
              <Select label="Giro" value={form.values.giro} options={giroOptions} onChange={setField('giro')} placeholder="Sin giro" />
            </View>
            <View className="min-w-[120px] flex-1">
              <FormField label="UxB" value={form.values.uxb} onChangeText={setField('uxb')} keyboardType="numeric" placeholder="Unidades por bolsa" />
            </View>
          </View>

          <FormField label="Observaciones / aplicación" value={form.values.observaciones} onChangeText={setField('observaciones')} placeholder="Marca / modelo / motor" multiline />

          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[180px] flex-1">
              <FormField label="Precio de lista" value={form.values.precioLista} onChangeText={setField('precioLista')} keyboardType="numeric" placeholder="0.00" />
            </View>
            <View className="min-w-[160px] flex-1">
              <FormField label="Stock mínimo" value={form.values.stockMinimo} onChangeText={setField('stockMinimo')} keyboardType="numeric" />
            </View>
            {form.mode === 'create' ? (
              <View className="min-w-[160px] flex-1">
                <FormField label="Stock inicial" value={form.values.stockInicial} onChangeText={setField('stockInicial')} keyboardType="numeric" />
              </View>
            ) : null}
          </View>

          <FormField
            label="Equivalencias OEM"
            value={form.values.equivalencias}
            onChangeText={setField('equivalencias')}
            placeholder="Separadas por coma. Ej: 90311-32001, 12345"
            help="Se cargan como códigos OEM del producto."
          />

          <Switch label="Próximo ingreso" value={form.values.proximoIngreso} onValueChange={setField('proximoIngreso')} />
          <Switch label="Activo" value={form.values.activo} onValueChange={setField('activo')} />

          {form.error ? <Text variant="caption" className="mt-1 text-danger">{form.error}</Text> : null}
        </View>
      </ModalPopup>

      {/* Stock mínimo */}
      <ModalPopup
        visible={stockModal.visible}
        onClose={() => setStockModal({ visible: false, producto: null, valor: '0' })}
        title="Stock mínimo"
        maxWidth={420}
        footer={
          <>
            <Button variant="secondary" label="Cancelar" onPress={() => setStockModal({ visible: false, producto: null, valor: '0' })} />
            <Button label="Guardar" onPress={guardarStock} />
          </>
        }
      >
        <Text muted className="mb-2">{stockModal.producto?.codigo}</Text>
        <FormField
          label="Cantidad mínima"
          value={stockModal.valor}
          onChangeText={(v) => setStockModal((s) => ({ ...s, valor: v }))}
          keyboardType="numeric"
        />
      </ModalPopup>
    </View>
  );
}

export default ProductosScreen;
