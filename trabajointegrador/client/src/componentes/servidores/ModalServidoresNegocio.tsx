/**
 * @file Acceso y gestión de Servidores Únicos por Negocio mediante Código Único (ID)
 *       y Contraseña. Todos los servidores de la base de datos permanecen ocultos:
 *       la aplicación inicia sin ningún negocio vinculado y exige autenticarse con
 *       el Código Único (ID) y la contraseña del servidor para poder operar.
 * @module client/src/componentes/servidores/ModalServidoresNegocio
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';

import {
  autenticarServidorConCredenciales,
  desconectarServidorNegocioActual,
  eliminarServidorNegocio,
  registrarNuevoServidorConCredenciales,
  seleccionarServidorNegocio,
  useServidorNegocio,
  type ServidorNegocio
} from '../../servicios/api';
import { useTema } from '../../tema/TemaProvider';
import { cn } from '../../utils/cn';
import { usePopUps } from '../popups/PopUpsProvider';
import { Boton } from '../ui/Boton';
import { Entrada } from '../ui/Entrada';
import { Insignia } from '../ui/Insignia';
import { EncabezadoTarjeta } from '../ui/Tarjeta';

export interface SelectorServidorNegocioProps {
  compacto?: boolean;
}

/**
 * Pastilla + modal seguro para gestionar el Servidor de Negocio activo.
 * Nunca muestra servidores de la base de datos que no hayan sido desbloqueados
 * en este dispositivo con su Código Único (ID) y Contraseña.
 */
export function SelectorServidorNegocio({ compacto = false }: SelectorServidorNegocioProps) {
  const { tokens, esOscuro, claseRaiz, estiloVariables } = useTema();
  const { avisar, confirmar } = usePopUps();
  const { servidorActivo, servidores, tieneServidorVinculado } = useServidorNegocio();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [pestana, setPestana] = useState<'ingresar' | 'crear' | 'vinculados'>('ingresar');

  // Campos para Ingresar a un Servidor Oculto (ID + Contraseña)
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [passwordAcceso, setPasswordAcceso] = useState('');
  const [urlAcceso, setUrlAcceso] = useState('');

  // Campos para Registrar un Nuevo Servidor Único
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [nuevaUrl, setNuevaUrl] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');

  const [procesando, setProcesando] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const scrollModalRef = useRef<any>(null);

  useEffect(() => {
    const s1 = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const s2 = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  const desplazarAbajo = () => {
    setTimeout(() => scrollModalRef.current?.scrollToEnd({ animated: true }), 90);
    setTimeout(() => scrollModalRef.current?.scrollToEnd({ animated: true }), 260);
    setTimeout(() => scrollModalRef.current?.scrollToEnd({ animated: true }), 440);
  };

  const abrirModal = () => {
    setCodigoAcceso('');
    setPasswordAcceso('');
    setUrlAcceso('');
    setPestana(tieneServidorVinculado ? 'vinculados' : 'ingresar');
    setModalAbierto(true);
  };

  const conectarConCredenciales = async () => {
    if (!codigoAcceso.trim() || !passwordAcceso) {
      avisar('Ingresá el Código Único (ID) y la contraseña del servidor.', 'advertencia');
      return;
    }
    setProcesando(true);
    try {
      const srv = await autenticarServidorConCredenciales({
        codigoServidor: codigoAcceso,
        password: passwordAcceso,
        urlServidor: urlAcceso
      });
      setCodigoAcceso('');
      setPasswordAcceso('');
      avisar(
        `Acceso concedido al servidor "${srv.nombre}" (${srv.codigoServidor}).`,
        'exito'
      );
      setModalAbierto(false);
    } catch (error) {
      avisar(
        error instanceof Error
          ? error.message
          : 'Código Único (ID) o contraseña del servidor incorrectos.',
        'peligro'
      );
    } finally {
      setProcesando(false);
    }
  };

  const registrarNuevo = async () => {
    if (!nuevoNombre.trim() || !nuevoCodigo.trim() || nuevaPassword.length < 4) {
      avisar(
        'Completá el nombre del negocio, el Código Único (ID) y una contraseña de al menos 4 caracteres.',
        'advertencia'
      );
      return;
    }
    setProcesando(true);
    try {
      const srv = await registrarNuevoServidorConCredenciales({
        nombre: nuevoNombre,
        codigoServidor: nuevoCodigo,
        password: nuevaPassword,
        urlServidor: nuevaUrl,
        descripcion: nuevaDescripcion
      });
      setNuevoNombre('');
      setNuevoCodigo('');
      setNuevaPassword('');
      setNuevaUrl('');
      setNuevaDescripcion('');
      avisar(
        `Servidor "${srv.nombre}" (${srv.codigoServidor}) creado y vinculado con éxito.`,
        'exito'
      );
      setModalAbierto(false);
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo registrar el servidor.',
        'peligro'
      );
    } finally {
      setProcesando(false);
    }
  };

  const desvincularServidor = async (srv: ServidorNegocio) => {
    const ok = await confirmar({
      titulo: `Cerrar conexión con ${srv.nombre}`,
      mensaje: `¿Querés desvincular el servidor "${srv.nombre}" (${srv.codigoServidor}) de este dispositivo? Para volver a entrar necesitarás su Código Único (ID) y contraseña.`,
      textoAceptar: 'Desvincular servidor',
      peligroso: true
    });
    if (!ok) return;
    if (srv.id === servidorActivo.id && servidores.length <= 1) {
      await desconectarServidorNegocioActual();
      setModalAbierto(false);
    } else {
      await eliminarServidorNegocio(srv.id);
    }
    avisar(`Servidor "${srv.nombre}" desvinculado y ocultado.`, 'info');
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          tieneServidorVinculado
            ? `Servidor activo: ${servidorActivo.nombre}. Tocar para gestionar servidor.`
            : 'Sin servidor vinculado. Tocar para ingresar Código Único (ID) y contraseña.'
        }
        onPress={abrirModal}
        style={{
          backgroundColor: tieneServidorVinculado
            ? `${tokens.primario}16`
            : `${tokens.advertencia}18`,
          borderColor: tieneServidorVinculado
            ? `${tokens.primario}45`
            : `${tokens.advertencia}55`
        }}
        className={cn(
          'flex-row items-center gap-2 rounded-xl border px-3 py-2 active:opacity-80',
          compacto && 'justify-center px-2'
        )}
      >
        <Ionicons
          name={tieneServidorVinculado ? 'lock-closed-outline' : 'key-outline'}
          size={16}
          color={tieneServidorVinculado ? tokens.primario : tokens.advertencia}
        />
        {!compacto && (
          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              style={{ color: tokens.texto }}
              className="text-xs font-bold text-texto"
            >
              {tieneServidorVinculado
                ? `${servidorActivo.nombre} (${servidorActivo.codigoServidor})`
                : 'Sin servidor vinculado'}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: tokens.textoSuave }}
              className="text-[10px] text-texto-suave"
            >
              {tieneServidorVinculado
                ? 'Servidor privado autenticado · Cambiar o desvincular'
                : 'Tocar para ingresar ID de servidor y contraseña'}
            </Text>
          </View>
        )}
        {!compacto && (
          <Ionicons
            name="chevron-down-outline"
            size={14}
            color={tieneServidorVinculado ? tokens.primario : tokens.advertencia}
          />
        )}
      </Pressable>

      <Modal
        visible={modalAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAbierto(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 24}
          style={estiloVariables}
          className={cn(
            claseRaiz,
            'flex-1 items-center bg-black/60 p-4',
            tecladoVisible ? 'justify-start pt-4' : 'justify-center'
          )}
        >
          <View
            style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
            className="max-h-[92%] w-full max-w-lg rounded-2xl border border-borde bg-superficie p-5"
          >
            <ScrollView
              ref={scrollModalRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ paddingBottom: tecladoVisible ? 240 : 24 }}
              contentContainerClassName="gap-3.5"
            >
              <EncabezadoTarjeta
                titulo="Acceso Privado a Servidor de Negocio"
                descripcion="Los servidores están ocultos por seguridad. Ingresá el Código Único (ID) y la contraseña del servidor de tu negocio."
                icono="shield-checkmark-outline"
              />

              {/* Pestañas */}
              <View
                style={{ backgroundColor: tokens.superficieAlt, borderColor: tokens.borde }}
                className="flex-row rounded-xl border p-1"
              >
                {tieneServidorVinculado && (
                  <Pressable
                    onPress={() => setPestana('vinculados')}
                    style={{
                      backgroundColor:
                        pestana === 'vinculados' ? tokens.primario : 'transparent'
                    }}
                    className="flex-1 items-center justify-center rounded-lg py-2"
                  >
                    <Text
                      style={{
                        color:
                          pestana === 'vinculados'
                            ? esOscuro
                              ? tokens.fondo
                              : '#FFFFFF'
                            : tokens.textoSuave
                      }}
                      className="text-xs font-bold"
                    >
                      Servidor Activo
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => setPestana('ingresar')}
                  style={{
                    backgroundColor: pestana === 'ingresar' ? tokens.primario : 'transparent'
                  }}
                  className="flex-1 items-center justify-center rounded-lg py-2"
                >
                  <Text
                    style={{
                      color:
                        pestana === 'ingresar'
                          ? esOscuro
                            ? tokens.fondo
                            : '#FFFFFF'
                          : tokens.textoSuave
                    }}
                    className="text-xs font-bold"
                  >
                    Ingresar con ID
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setPestana('crear')}
                  style={{
                    backgroundColor: pestana === 'crear' ? tokens.primario : 'transparent'
                  }}
                  className="flex-1 items-center justify-center rounded-lg py-2"
                >
                  <Text
                    style={{
                      color:
                        pestana === 'crear'
                          ? esOscuro
                            ? tokens.fondo
                            : '#FFFFFF'
                          : tokens.textoSuave
                    }}
                    className="text-xs font-bold"
                  >
                    Nuevo Servidor
                  </Text>
                </Pressable>
              </View>

              {pestana === 'vinculados' && tieneServidorVinculado ? (
                <View className="gap-3">
                  {servidores.map((srv) => {
                    const esActivo = srv.id === servidorActivo.id;
                    return (
                      <View
                        key={srv.id}
                        style={{
                          backgroundColor: esActivo
                            ? `${tokens.primario}14`
                            : tokens.superficieAlt,
                          borderColor: esActivo ? tokens.primario : tokens.borde
                        }}
                        className="rounded-xl border p-3.5"
                      >
                        <View className="flex-row flex-wrap items-center justify-between gap-2">
                          <View className="flex-row items-center gap-2">
                            <Ionicons
                              name="lock-closed"
                              size={16}
                              color={esActivo ? tokens.primario : tokens.textoSuave}
                            />
                            <Text
                              style={{ color: tokens.texto }}
                              className="text-base font-bold text-texto"
                            >
                              {srv.nombre}
                            </Text>
                            <Insignia
                              texto={`ID: ${srv.codigoServidor}`}
                              tono={esActivo ? 'primario' : 'neutro'}
                            />
                          </View>
                          {esActivo && <Insignia texto="CONECTADO" tono="exito" />}
                        </View>

                        <Text
                          style={{ color: tokens.textoSuave }}
                          className="mt-1 text-xs text-texto-suave"
                        >
                          {srv.descripcion}
                        </Text>

                        <View className="mt-3 flex-row flex-wrap justify-end gap-2">
                          {!esActivo && (
                            <Boton
                              titulo="Activar este servidor"
                              icono="flash-outline"
                              tamano="sm"
                              onPress={async () => {
                                await seleccionarServidorNegocio(srv.id);
                                avisar(`Conectado a ${srv.nombre}.`, 'exito');
                                setModalAbierto(false);
                              }}
                            />
                          )}
                          <Boton
                            titulo="Desvincular servidor"
                            icono="log-out-outline"
                            variante="peligro"
                            tamano="sm"
                            onPress={() => void desvincularServidor(srv)}
                          />
                        </View>
                      </View>
                    );
                  })}

                  <View className="flex-row justify-between gap-2 pt-1">
                    <Boton
                      titulo="Conectar otro servidor con ID"
                      icono="key-outline"
                      variante="contorno"
                      tamano="sm"
                      onPress={() => setPestana('ingresar')}
                    />
                    <Boton
                      titulo="Cerrar"
                      variante="secundario"
                      tamano="sm"
                      onPress={() => setModalAbierto(false)}
                    />
                  </View>
                </View>
              ) : pestana === 'ingresar' ? (
                <View className="gap-3">
                  <Entrada
                    etiqueta="Código Único del Servidor (ID) *"
                    icono="hardware-chip-outline"
                    placeholder="Ej: SRV-NEGOCIO-01"
                    autoCapitalize="characters"
                    value={codigoAcceso}
                    onChangeText={setCodigoAcceso}
                  />

                  <Entrada
                    etiqueta="Contraseña del Servidor *"
                    icono="lock-closed-outline"
                    placeholder="Contraseña privada del servidor"
                    secureTextEntry
                    autoCapitalize="none"
                    value={passwordAcceso}
                    onChangeText={setPasswordAcceso}
                    onFocus={desplazarAbajo}
                  />

                  <Entrada
                    etiqueta="URL de Servidor Propio (opcional)"
                    icono="globe-outline"
                    placeholder="Vacío = conexión automática al nodo del servidor"
                    autoCapitalize="none"
                    value={urlAcceso}
                    onChangeText={setUrlAcceso}
                    onFocus={desplazarAbajo}
                  />

                  <View className="mt-2 flex-row justify-end gap-2">
                    <Boton
                      titulo="Cerrar"
                      variante="secundario"
                      onPress={() => setModalAbierto(false)}
                    />
                    <Boton
                      titulo="Autenticar y Conectar"
                      icono="key-outline"
                      cargando={procesando}
                      onPress={() => void conectarConCredenciales()}
                    />
                  </View>
                </View>
              ) : (
                <View className="gap-3">
                  <Entrada
                    etiqueta="Nombre del Negocio / Empresa *"
                    icono="business-outline"
                    placeholder="Ej: Sucursal Norte"
                    value={nuevoNombre}
                    onChangeText={setNuevoNombre}
                  />
                  <Entrada
                    etiqueta="Definir Código Único del Servidor (ID) *"
                    icono="hardware-chip-outline"
                    placeholder="Ej: SRV-NEGOCIO-03"
                    autoCapitalize="characters"
                    value={nuevoCodigo}
                    onChangeText={setNuevoCodigo}
                  />
                  <Entrada
                    etiqueta="Definir Contraseña del Servidor *"
                    icono="lock-closed-outline"
                    placeholder="Mínimo 4 caracteres"
                    secureTextEntry
                    autoCapitalize="none"
                    value={nuevaPassword}
                    onChangeText={setNuevaPassword}
                    onFocus={desplazarAbajo}
                  />
                  <Entrada
                    etiqueta="URL del Servidor Propio (opcional)"
                    icono="globe-outline"
                    placeholder="Vacío = crear nodo aislado automático"
                    autoCapitalize="none"
                    value={nuevaUrl}
                    onChangeText={setNuevaUrl}
                    onFocus={desplazarAbajo}
                  />

                  <View className="mt-2 flex-row justify-end gap-2">
                    <Boton
                      titulo="Cancelar"
                      variante="secundario"
                      onPress={() => setModalAbierto(false)}
                    />
                    <Boton
                      titulo="Crear Servidor y Conectar"
                      icono="checkmark-circle-outline"
                      cargando={procesando}
                      onPress={() => void registrarNuevo()}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
