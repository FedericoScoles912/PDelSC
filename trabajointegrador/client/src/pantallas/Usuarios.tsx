/**
 * @file Módulo de gestión de usuarios y roles (exclusivo Administrador).
 * @module client/src/pantallas/Usuarios
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton, BotonIcono } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Insignia, tonoDeEstado, tonoDeRol } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { peticion, peticionConMeta } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

interface UsuarioFila {
  id: number;
  email: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  activo: number;
  rol_codigo: string;
  rol_nombre: string;
  creado_en: string;
}

interface RolFila {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

/** Pantalla de administración de usuarios. */
export function Usuarios() {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar } = usePopUps();

  const [usuarios, setUsuarios] = useState<UsuarioFila[]>([]);
  const [roles, setRoles] = useState<RolFila[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Modal de alta / edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<UsuarioFila | null>(null);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rolCodigo, setRolCodigo] = useState('vendedor');
  const [password, setPassword] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true);
      else setRefrescando(true);
      try {
        const [{ datos }, listaRoles] = await Promise.all([
          peticionConMeta<UsuarioFila[]>('/usuarios', {
            consulta: {
              q: busqueda.trim() || undefined,
              rol: filtroRol || undefined,
              limite: 50
            }
          }),
          peticion<RolFila[]>('/usuarios/roles')
        ]);
        setUsuarios(datos);
        setRoles(listaRoles);
      } catch (error) {
        avisar(
          error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.',
          'peligro'
        );
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [busqueda, filtroRol, avisar]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setEditando(null);
    setEmail('');
    setNombre('');
    setApellido('');
    setTelefono('');
    setRolCodigo('vendedor');
    setPassword('');
    setModalAbierto(true);
  };

  const abrirEdicion = (u: UsuarioFila) => {
    setEditando(u);
    setEmail(u.email);
    setNombre(u.nombre);
    setApellido(u.apellido ?? '');
    setTelefono(u.telefono ?? '');
    setRolCodigo(u.rol_codigo);
    setPassword('');
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      avisar('El nombre es obligatorio.', 'advertencia');
      return;
    }
    if (!editando && (!email.trim() || password.length < 8)) {
      avisar('Ingresá un email válido y contraseña de al menos 8 caracteres.', 'advertencia');
      return;
    }

    setGuardando(true);
    try {
      if (editando) {
        await peticion(`/usuarios/${editando.id}`, {
          metodo: 'PUT',
          cuerpo: {
            email: email.trim().toLowerCase(),
            nombre: nombre.trim(),
            apellido: apellido.trim() || null,
            telefono: telefono.trim() || null,
            rol: rolCodigo,
            password: password.trim() ? password.trim() : undefined
          }
        });
        avisar('Usuario actualizado correctamente.', 'exito');
      } else {
        await peticion('/usuarios', {
          metodo: 'POST',
          cuerpo: {
            email: email.trim(),
            password,
            nombre: nombre.trim(),
            apellido: apellido.trim() || undefined,
            telefono: telefono.trim() || undefined,
            rol: rolCodigo
          }
        });
        avisar('Usuario creado correctamente.', 'exito');
      }
      setModalAbierto(false);
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo guardar el usuario.',
        'peligro'
      );
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivo = async (u: UsuarioFila) => {
    try {
      await peticion(`/usuarios/${u.id}/activo`, {
        metodo: 'PATCH',
        cuerpo: { activo: Number(u.activo) !== 1 }
      });
      avisar('Estado del usuario actualizado.', 'exito');
      await cargar(true);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo cambiar el estado.',
        'peligro'
      );
    }
  };

  return (
    <View style={{ backgroundColor: tokens.fondo }} className="flex-1 bg-fondo">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => void cargar(true)}
            tintColor={tokens.primario}
          />
        }
      >
        {/* Encabezado */}
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12">
              <Ionicons name="people-outline" size={24} color={tokens.primario} />
            </View>
            <View>
              <Text className="text-xl font-bold text-texto">Usuarios y Roles</Text>
              <Text className="text-sm text-texto-suave">
                Administración de cuentas y permisos de acceso a Stocker
              </Text>
            </View>
          </View>
          <Boton
            titulo="Nuevo usuario"
            icono="person-add-outline"
            tamano="sm"
            onPress={abrirNuevo}
          />
        </View>

        {/* Búsqueda y filtro */}
        <Tarjeta compacta clase="gap-3">
          <Entrada
            icono="search-outline"
            placeholder="Buscar por nombre, apellido o correo…"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <View className="flex-row flex-wrap gap-2">
            {[
              { codigo: '', nombre: 'Todos los roles' },
              ...roles.map((r) => ({ codigo: r.codigo, nombre: r.nombre }))
            ].map((item) => {
              const activo = filtroRol === item.codigo;
              return (
                <Pressable
                  key={item.codigo}
                  onPress={() => setFiltroRol(item.codigo)}
                  className={cn(
                    'rounded-full border px-3 py-1.5',
                    activo
                      ? 'border-primario bg-primario'
                      : 'border-borde bg-superficie-alt'
                  )}
                >
                  <Text className={cn('text-xs font-bold', activo ? 'text-white' : 'text-texto')}>
                    {item.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Tarjeta>

        {cargando ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={tokens.primario} />
          </View>
        ) : (
          <View className="gap-3">
            {usuarios.map((u) => (
              <Tarjeta
                key={u.id}
                compacta
                clase="flex-row flex-wrap items-center justify-between gap-3"
              >
                <View className="min-w-[200px] flex-1 gap-1">
                  <Text className="text-base font-bold text-texto">
                    {u.nombre} {u.apellido ?? ''}
                  </Text>
                  <Text className="text-xs text-texto-suave">
                    {u.email}
                    {u.telefono ? ` · Tel: ${u.telefono}` : ''}
                  </Text>
                  <View className="mt-1 flex-row flex-wrap gap-2">
                    <Insignia texto={u.rol_nombre} tono={tonoDeRol(u.rol_codigo)} />
                    <Insignia
                      texto={Number(u.activo) === 1 ? 'ACTIVO' : 'INACTIVO'}
                      tono={tonoDeEstado(u.activo)}
                    />
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <BotonIcono
                    icono="create-outline"
                    onPress={() => abrirEdicion(u)}
                    accessibilityLabel="Editar usuario"
                  />
                  <BotonIcono
                    icono={Number(u.activo) === 1 ? 'ban-outline' : 'checkmark-circle-outline'}
                    color={Number(u.activo) === 1 ? tokens.peligro : tokens.exito}
                    onPress={() => void alternarActivo(u)}
                    accessibilityLabel="Activar o desactivar usuario"
                  />
                </View>
              </Tarjeta>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAbierto(false)}
      >
        <View
          style={estiloVariables}
          className={cn(claseRaiz, 'flex-1 items-center justify-center bg-black/50 p-4')}
        >
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="max-h-[90%] w-full max-w-md rounded-2xl border border-borde bg-superficie p-5"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3">
              <EncabezadoTarjeta
                titulo={editando ? 'Editar Usuario' : 'Nuevo Usuario'}
                icono="person-outline"
              />
              <Entrada
                etiqueta="Correo electrónico *"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="usuario@stocker.com"
                value={email}
                onChangeText={setEmail}
              />
              <Entrada
                etiqueta="Nombre *"
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
              />
              <Entrada
                etiqueta="Apellido"
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
              />
              <Entrada
                etiqueta="Teléfono"
                placeholder="+54 11 …"
                value={telefono}
                onChangeText={setTelefono}
              />

              <Text className="text-sm font-semibold text-texto-suave">Rol del sistema</Text>
              <View className="flex-row flex-wrap gap-2">
                {(['admin', 'deposito', 'vendedor'] as const).map((cod) => (
                  <Pressable
                    key={cod}
                    onPress={() => setRolCodigo(cod)}
                    className={cn(
                      'rounded-xl border px-3 py-2',
                      rolCodigo === cod
                        ? 'border-primario bg-primario'
                        : 'border-borde bg-superficie-alt'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-bold uppercase',
                        rolCodigo === cod ? 'text-white' : 'text-texto'
                      )}
                    >
                      {cod}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Entrada
                etiqueta={
                  editando
                    ? 'Nueva contraseña (dejar vacío para no cambiar)'
                    : 'Contraseña inicial (mín. 8 caracteres) *'
                }
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <View className="mt-3 flex-row justify-end gap-2">
                <Boton
                  titulo="Cancelar"
                  variante="secundario"
                  onPress={() => setModalAbierto(false)}
                />
                <Boton titulo="Guardar" cargando={guardando} onPress={() => void guardar()} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
