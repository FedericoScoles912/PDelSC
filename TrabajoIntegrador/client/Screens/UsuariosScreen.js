/**
 * UsuariosScreen.js
 * Gestión de usuarios (sólo Administrador): alta, edición, rol y estado.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { Badge } from '../Components/atoms/Badge';
import { IconButton } from '../Components/atoms/IconButton';
import { FormField } from '../Components/molecules/FormField';
import { Select } from '../Components/molecules/Select';
import { SearchBar } from '../Components/molecules/SearchBar';
import { Pagination } from '../Components/molecules/Pagination';
import { ModalPopup } from '../Components/molecules/ModalPopup';
import { DataTable } from '../Components/organisms/DataTable';
import { useFeedback } from '../Components/organisms/FeedbackProvider';
import {
  useGetUsuariosQuery, useGetRolesQuery, useCrearUsuarioMutation,
  useActualizarUsuarioMutation, useSetUsuarioEstadoMutation, useEliminarUsuarioMutation,
} from '../Store/apiSlice';
import { formatDate as fmtDate } from '../Utils/format';
import { rolLabel } from '../Utils/roles';

const vacio = { nombre: '', apellido: '', email: '', password: '', rolId: null };

export function UsuariosScreen() {
  const { toast, dialog } = useFeedback();
  const [filtros, setFiltros] = useState({ page: 1, limit: 15, search: '', rolId: null, activo: null });
  const [form, setForm] = useState({ visible: false, mode: 'create', values: vacio, error: '' });

  const { data, isLoading, isFetching } = useGetUsuariosQuery({
    page: filtros.page,
    limit: filtros.limit,
    search: filtros.search || undefined,
    rolId: filtros.rolId || undefined,
    activo: filtros.activo === null ? undefined : filtros.activo,
  });
  const { data: rolesData } = useGetRolesQuery();

  const [crear, { isLoading: creando }] = useCrearUsuarioMutation();
  const [actualizar, { isLoading: actualizando }] = useActualizarUsuarioMutation();
  const [setEstado] = useSetUsuarioEstadoMutation();
  const [eliminar] = useEliminarUsuarioMutation();

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta;
  const roles = rolesData?.data ?? [];
  const rolOptions = roles.map((r) => ({ label: rolLabel(r.nombre), value: r.id }));

  const set = (patch) => setFiltros((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  const setField = (k) => (v) => setForm((s) => ({ ...s, values: { ...s.values, [k]: v } }));

  const abrirNuevo = () => setForm({ visible: true, mode: 'create', values: { ...vacio }, error: '' });

  const abrirEditar = (u) => setForm({
    visible: true,
    mode: 'edit',
    error: '',
    values: { id: u.id, nombre: u.nombre ?? '', apellido: u.apellido ?? '', email: u.email ?? '', password: '', rolId: u.rolId ?? null },
  });

  const guardar = async () => {
    const v = form.values;
    if (!v.nombre.trim() || !v.apellido.trim() || !v.email.trim() || !v.rolId) {
      setForm((s) => ({ ...s, error: 'Completá nombre, apellido, email y rol' }));
      return;
    }
    if (form.mode === 'create' && (!v.password || v.password.length < 8)) {
      setForm((s) => ({ ...s, error: 'La contraseña debe tener al menos 8 caracteres' }));
      return;
    }
    try {
      if (form.mode === 'create') {
        await crear({ nombre: v.nombre.trim(), apellido: v.apellido.trim(), email: v.email.trim(), password: v.password, rolId: v.rolId }).unwrap();
        toast({ message: 'Usuario creado', tone: 'success' });
      } else {
        const payload = { nombre: v.nombre.trim(), apellido: v.apellido.trim(), email: v.email.trim(), rolId: v.rolId };
        if (v.password) payload.password = v.password;
        await actualizar({ id: v.id, ...payload }).unwrap();
        toast({ message: 'Usuario actualizado', tone: 'success' });
      }
      setForm({ visible: false, mode: 'create', values: vacio, error: '' });
    } catch (err) {
      setForm((s) => ({ ...s, error: err?.data?.error?.message || 'No se pudo guardar el usuario' }));
    }
  };

  const toggleEstado = async (u) => {
    const ok = await dialog({
      title: u.activo ? 'Desactivar usuario' : 'Activar usuario',
      message: u.activo
        ? `Se revocarán las sesiones activas de ${u.email}.`
        : `Se habilitará el acceso de ${u.email}.`,
      confirmLabel: u.activo ? 'Desactivar' : 'Activar',
      tone: u.activo ? 'warning' : 'info',
    });
    if (!ok) return;
    try {
      await setEstado({ id: u.id, activo: !u.activo }).unwrap();
      toast({ message: u.activo ? 'Usuario desactivado' : 'Usuario activado', tone: 'success' });
    } catch (err) {
      toast({ message: err?.data?.error?.message || 'No se pudo cambiar el estado', tone: 'error' });
    }
  };

  const confirmarEliminar = async (u) => {
    const ok = await dialog({
      title: 'Eliminar usuario',
      message: `¿Eliminar definitivamente a ${u.email}?`,
      confirmLabel: 'Eliminar',
      tone: 'error',
    });
    if (!ok) return;
    try {
      await eliminar(u.id).unwrap();
      toast({ message: 'Usuario eliminado', tone: 'success' });
    } catch (err) {
      toast({ message: err?.data?.error?.message || 'No se pudo eliminar', tone: 'error' });
    }
  };

  const columns = useMemo(() => [
    { key: 'nombre', label: 'Nombre', minWidth: 180, render: (u) => (
      <View>
        <Text className="text-sm font-semibold">{u.nombre} {u.apellido}</Text>
        <Text variant="caption" muted>{u.email}</Text>
      </View>
    ) },
    { key: 'rol', label: 'Rol', width: 160, render: (u) => <Badge tone="brand" label={rolLabel(u.rol)} /> },
    { key: 'activo', label: 'Estado', width: 120, render: (u) => <Badge tone={u.activo ? 'success' : 'neutral'} label={u.activo ? 'Activo' : 'Inactivo'} /> },
    { key: 'ultimoLogin', label: 'Último ingreso', width: 160, render: (u) => <Text className="text-sm" muted>{u.ultimoLogin ? fmtDate(u.ultimoLogin, { conHora: true }) : '—'}</Text> },
    { key: 'creadoEn', label: 'Alta', width: 140, render: (u) => <Text className="text-sm" muted>{fmtDate(u.creadoEn)}</Text> },
  ], []);

  return (
    <View>
      <View className="mb-4 flex-row flex-wrap items-end justify-between gap-3">
        <View className="flex-1">
          <Text variant="h2" className="mb-1">Usuarios</Text>
          <Text muted>Altas, roles y estado de las cuentas</Text>
        </View>
        <Button icon="plus" label="Nuevo usuario" onPress={abrirNuevo} />
      </View>

      <Card className="mb-4">
        <View className="flex-row flex-wrap items-end gap-3">
          <View className="min-w-[220px] flex-1">
            <SearchBar value={filtros.search} onChangeText={(v) => set({ search: v })} placeholder="Buscar por nombre o email..." />
          </View>
          <View className="min-w-[200px] flex-1">
            <Select
              value={filtros.rolId}
              options={[{ label: 'Todos los roles', value: null }, ...rolOptions]}
              onChange={(v) => set({ rolId: v })}
              placeholder="Todos los roles"
            />
          </View>
          <View className="min-w-[160px] flex-1">
            <Select
              label="Estado"
              value={filtros.activo}
              options={[{ label: 'Todos', value: null }, { label: 'Activos', value: 1 }, { label: 'Inactivos', value: 0 }]}
              onChange={(v) => set({ activo: v })}
              placeholder="Todos"
            />
          </View>
        </View>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading || isFetching}
          emptyTitle="Sin usuarios"
          actionsWidth={130}
          renderActions={(u) => (
            <View className="flex-row justify-end gap-2">
              <IconButton name="edit" size={30} onPress={() => abrirEditar(u)} />
              <IconButton name={u.activo ? 'close' : 'check'} size={30} onPress={() => toggleEstado(u)} />
              <IconButton name="trash" size={30} variant="danger" onPress={() => confirmarEliminar(u)} />
            </View>
          )}
        />
        <View className="px-3">
          <Pagination meta={meta} onPage={(p) => setFiltros((f) => ({ ...f, page: p }))} />
        </View>
      </Card>

      <ModalPopup
        visible={form.visible}
        onClose={() => setForm((s) => ({ ...s, visible: false }))}
        title={form.mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
        maxWidth={560}
        footer={
          <>
            <Button variant="secondary" label="Cancelar" onPress={() => setForm((s) => ({ ...s, visible: false }))} />
            <Button label="Guardar" loading={creando || actualizando} onPress={guardar} />
          </>
        }
      >
        <View>
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[160px] flex-1"><FormField label="Nombre" required value={form.values.nombre} onChangeText={setField('nombre')} /></View>
            <View className="min-w-[160px] flex-1"><FormField label="Apellido" required value={form.values.apellido} onChangeText={setField('apellido')} /></View>
          </View>
          <FormField label="Email" required value={form.values.email} onChangeText={setField('email')} autoCapitalize="none" keyboardType="email-address" />
          <Select
            label="Rol"
            value={form.values.rolId}
            options={rolOptions}
            onChange={setField('rolId')}
            placeholder="Seleccioná un rol"
          />
          <FormField
            label={form.mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
            required={form.mode === 'create'}
            value={form.values.password}
            onChangeText={setField('password')}
            secureTextEntry
            placeholder="Mínimo 8 caracteres"
          />
          {form.error ? <Text variant="caption" className="text-danger">{form.error}</Text> : null}
        </View>
      </ModalPopup>
    </View>
  );
}

export default UsuariosScreen;
