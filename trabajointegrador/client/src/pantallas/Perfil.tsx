/**
 * @file Pantalla de perfil de usuario: edición de datos personales,
 *       preferencia de tema y cambio de contraseña.
 * @module client/src/pantallas/Perfil
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { Insignia, tonoDeRol } from '../componentes/ui/Insignia';
import { EncabezadoTarjeta, Tarjeta } from '../componentes/ui/Tarjeta';
import { actualizarPerfil } from '../estado/sesionSlice';
import { useDespacho, useSeleccionar } from '../estado/store';
import { peticion } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';
import { cn } from '../utils/cn';

const ROLES_DISPONIBLES = [
  { codigo: 'admin', nombre: 'Administrador' },
  { codigo: 'deposito', nombre: 'Encargado de Depósito' },
  { codigo: 'vendedor', nombre: 'Vendedor / Consulta' }
] as const;

/** Pantalla Mi Cuenta (Perfil). */
export function Perfil() {
  const { tokens, esquema, esOscuro, fijar } = useTema();
  const { avisar } = usePopUps();
  const despachar = useDespacho();
  const usuario = useSeleccionar((estado) => estado.sesion.usuario);

  const esAdmin = usuario?.rol.codigo === 'admin';

  const [email, setEmail] = useState(usuario?.email ?? '');
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [apellido, setApellido] = useState(usuario?.apellido ?? '');
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '');
  const [rolSeleccionado, setRolSeleccionado] = useState(usuario?.rol.codigo ?? 'vendedor');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [nueva, setNueva] = useState('');
  const [confirmarNueva, setConfirmarNueva] = useState('');
  const [guardandoPass, setGuardandoPass] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setEmail(usuario.email ?? '');
    setNombre(usuario.nombre ?? '');
    setApellido(usuario.apellido ?? '');
    setTelefono(usuario.telefono ?? '');
    setRolSeleccionado(usuario.rol.codigo ?? 'vendedor');
  }, [usuario]);

  const guardarDatos = async () => {
    const emailLimpio = email.trim().toLowerCase();
    if (!emailLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      avisar('Ingresá un correo electrónico válido.', 'advertencia');
      return;
    }
    if (!nombre.trim()) {
      avisar('El nombre no puede quedar vacío.', 'advertencia');
      return;
    }
    setGuardandoPerfil(true);
    try {
      const cuerpoActualizacion: Record<string, any> = {
        email: emailLimpio,
        nombre: nombre.trim(),
        apellido: apellido.trim() || null,
        telefono: telefono.trim() || null
      };
      if (esAdmin) {
        cuerpoActualizacion.rol = rolSeleccionado;
      }
      const res = await despachar(actualizarPerfil(cuerpoActualizacion));
      if (actualizarPerfil.fulfilled.match(res)) {
        avisar('Datos de la cuenta actualizados correctamente.', 'exito');
      } else {
        avisar(res.payload ?? 'No se pudo actualizar el perfil.', 'peligro');
      }
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarPassword = async () => {
    if (nueva.length < 8) {
      avisar('La nueva contraseña debe tener al menos 8 caracteres.', 'advertencia');
      return;
    }
    if (confirmarNueva && nueva !== confirmarNueva) {
      avisar('La confirmación de la nueva contraseña no coincide.', 'advertencia');
      return;
    }
    setGuardandoPass(true);
    try {
      await peticion('/auth/cambiar-password', {
        metodo: 'POST',
        cuerpo: { nueva }
      });
      setNueva('');
      setConfirmarNueva('');
      avisar('Contraseña actualizada correctamente.', 'exito');
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.',
        'peligro'
      );
    } finally {
      setGuardandoPass(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: tokens.fondo }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={{ backgroundColor: tokens.fondo }}
        className="flex-1 bg-fondo"
        contentContainerStyle={{ padding: 20, paddingBottom: 280, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: `${tokens.primario}22` }}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-primario/12"
        >
          <Ionicons name="person-circle-outline" size={26} color={tokens.primario} />
        </View>
        <View className="flex-1">
          <Text style={{ color: tokens.texto }} className="text-xl font-bold text-texto">
            Mi Cuenta
          </Text>
          <Text style={{ color: tokens.textoSuave }} className="text-sm text-texto-suave">
            Modificá tu correo, datos personales, rol, contraseña y apariencia en Stocker
          </Text>
        </View>
      </View>

      {/* Resumen de cuenta y selector de tema Claro / Oscuro */}
      <Tarjeta clase="gap-4">
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <View className="gap-1">
            <Text style={{ color: tokens.texto }} className="text-lg font-bold text-texto">
              {usuario?.nombre} {usuario?.apellido ?? ''}
            </Text>
            <Text style={{ color: tokens.textoSuave }} className="text-sm text-texto-suave">
              {usuario?.email}
            </Text>
            <View className="mt-1 flex-row flex-wrap items-center gap-2">
              <Insignia
                texto={usuario?.rol.nombre ?? 'Usuario'}
                tono={tonoDeRol(usuario?.rol.codigo)}
              />
              <Insignia
                texto={esOscuro ? 'Modo Oscuro activo' : 'Modo Claro activo'}
                tono="info"
              />
            </View>
          </View>
        </View>

        <View
          style={{ borderColor: tokens.borde }}
          className="border-t border-borde pt-3"
        >
          <Text
            style={{ color: tokens.textoSuave }}
            className="mb-2 text-xs font-bold uppercase tracking-wider text-texto-suave"
          >
            Apariencia de la aplicación
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => fijar('claro')}
              style={{
                backgroundColor: esquema === 'claro' ? tokens.primario : tokens.superficieAlt,
                borderColor: esquema === 'claro' ? tokens.primario : tokens.borde
              }}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-4 py-2.5'
              )}
            >
              <Ionicons
                name="sunny-outline"
                size={18}
                color={esquema === 'claro' ? '#FFFFFF' : tokens.texto}
              />
              <Text
                style={{ color: esquema === 'claro' ? '#FFFFFF' : tokens.texto }}
                className="text-sm font-bold"
              >
                Modo Claro
              </Text>
            </Pressable>

            <Pressable
              onPress={() => fijar('oscuro')}
              style={{
                backgroundColor: esquema === 'oscuro' ? tokens.primario : tokens.superficieAlt,
                borderColor: esquema === 'oscuro' ? tokens.primario : tokens.borde
              }}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-4 py-2.5'
              )}
            >
              <Ionicons
                name="moon-outline"
                size={18}
                color={esquema === 'oscuro' ? tokens.fondo : tokens.texto}
              />
              <Text
                style={{ color: esquema === 'oscuro' ? tokens.fondo : tokens.texto }}
                className="text-sm font-bold"
              >
                Modo Oscuro
              </Text>
            </Pressable>
          </View>
        </View>
      </Tarjeta>

      {/* Editar todos los datos de la cuenta */}
      <Tarjeta clase="gap-3">
        <EncabezadoTarjeta
          titulo="Datos de la Cuenta"
          descripcion="Editá tu correo electrónico, nombre, apellido, teléfono y rol"
          icono="create-outline"
        />
        <Entrada
          etiqueta="Correo electrónico *"
          icono="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="correo@stocker.com"
          value={email}
          onChangeText={setEmail}
        />
        <Entrada
          etiqueta="Nombre *"
          icono="person-outline"
          placeholder="Tu nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <Entrada
          etiqueta="Apellido"
          icono="person-outline"
          placeholder="Tu apellido"
          value={apellido}
          onChangeText={setApellido}
        />
        <Entrada
          etiqueta="Teléfono"
          icono="call-outline"
          keyboardType="phone-pad"
          placeholder="+54 11 …"
          value={telefono}
          onChangeText={setTelefono}
        />

        <View className="gap-1.5 pt-1">
          <Text
            style={{ color: tokens.textoSuave }}
            className="text-sm font-semibold text-texto-suave"
          >
            Rol de la cuenta
          </Text>
          {esAdmin ? (
            <View className="flex-row flex-wrap gap-2">
              {ROLES_DISPONIBLES.map((item) => {
                const activo = rolSeleccionado === item.codigo;
                return (
                  <Pressable
                    key={item.codigo}
                    onPress={() => setRolSeleccionado(item.codigo)}
                    style={{
                      backgroundColor: activo ? tokens.primario : tokens.superficieAlt,
                      borderColor: activo ? tokens.primario : tokens.borde
                    }}
                    className="rounded-xl border px-3.5 py-2"
                  >
                    <Text
                      style={{
                        color: activo ? (esOscuro ? tokens.fondo : '#FFFFFF') : tokens.texto
                      }}
                      className="text-xs font-bold"
                    >
                      {item.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: tokens.superficieAlt,
                borderColor: tokens.borde
              }}
              className="flex-row items-center gap-2.5 rounded-xl border p-3"
            >
              <Insignia
                texto={usuario?.rol.nombre ?? 'Vendedor / Consulta'}
                tono={tonoDeRol(usuario?.rol.codigo)}
              />
              <Text
                style={{ color: tokens.textoSuave }}
                className="flex-1 text-xs text-texto-suave"
              >
                Solo un usuario Administrador puede modificar los roles del sistema.
              </Text>
            </View>
          )}
        </View>

        <View className="items-end pt-2">
          <Boton
            titulo="Guardar cambios"
            icono="save-outline"
            cargando={guardandoPerfil}
            onPress={() => void guardarDatos()}
          />
        </View>
      </Tarjeta>

      {/* Cambiar contraseña */}
      <Tarjeta clase="gap-3">
        <EncabezadoTarjeta
          titulo="Cambiar Contraseña"
          descripcion="Ingresá tu nueva clave (mínimo 8 caracteres). No requerís la anterior."
          icono="lock-closed-outline"
        />
        <Entrada
          etiqueta="Nueva contraseña"
          icono="key-outline"
          secureTextEntry
          placeholder="Mínimo 8 caracteres"
          value={nueva}
          onChangeText={setNueva}
        />
        <Entrada
          etiqueta="Confirmar nueva contraseña"
          icono="checkmark-circle-outline"
          secureTextEntry
          placeholder="Repetí la nueva contraseña"
          value={confirmarNueva}
          onChangeText={setConfirmarNueva}
        />
        <View className="items-end pt-1">
          <Boton
            titulo="Actualizar contraseña"
            icono="key-outline"
            cargando={guardandoPass}
            onPress={() => void cambiarPassword()}
          />
        </View>
      </Tarjeta>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}
