/**
 * @file Modales del Carrito de Reposición para productos con alerta de bajo stock.
 *       1) `ModalAgregarAlCarrito`: solicita Importador, Mail de la importadora
 *          y cantidad de unidades a pedir cuando se agrega un producto bajo stock,
 *          con desplazamiento automático para que el teclado del celular nunca tape
 *          el campo de cantidad ni los botones.
 *       2) `ModalCarritoImportador`: muestra los productos agregados con su código
 *          y cantidad solicitada, y genera/envía el PDF directamente a la importadora.
 * @module client/src/componentes/carrito/ModalCarritoImportador
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  View
} from 'react-native';

import {
  actualizarDatosImportadorCarrito,
  agregarProductoAlCarrito,
  cambiarCantidadItemCarrito,
  generarYEnviarPdfCarrito,
  obtenerCarritoActual,
  quitarItemCarrito,
  sincronizarCarritoDesdeServidor,
  useCarritoImportador,
  vaciarCarrito
} from '../../servicios/carrito';
import { useServidorNegocio } from '../../servicios/api';
import { useTema } from '../../tema/TemaProvider';
import { cn } from '../../utils/cn';
import { usePopUps } from '../popups/PopUpsProvider';
import { Boton, BotonIcono } from '../ui/Boton';
import { Entrada } from '../ui/Entrada';
import { Insignia } from '../ui/Insignia';
import { EncabezadoTarjeta } from '../ui/Tarjeta';

export interface ProductoParaCarrito {
  producto_id: number;
  codigo: string;
  categoria?: string | null;
  medidas?: string | null;
  stock: number;
  stock_minimo: number;
  faltante?: number;
}

export interface ModalAgregarAlCarritoProps {
  visible: boolean;
  producto: ProductoParaCarrito | null;
  onCerrar: () => void;
  onAbrirCarrito?: () => void;
}

/**
 * Modal que se abre al pulsar "Añadir al carrito" sobre un producto con alerta baja de stock.
 * Solicita el Importador, el Mail de la importadora y la cantidad de unidades solicitadas.
 */
export function ModalAgregarAlCarrito({
  visible,
  producto,
  onCerrar,
  onAbrirCarrito
}: ModalAgregarAlCarritoProps) {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar } = usePopUps();

  const [importador, setImportador] = useState('');
  const [emailImportador, setEmailImportador] = useState('');
  const [cantidad, setCantidad] = useState('10');
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const scrollAgregarRef = useRef<any>(null);

  useEffect(() => {
    const s1 = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const s2 = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  const desplazarACantidad = () => {
    setTimeout(() => {
      scrollAgregarRef.current?.scrollToEnd({ animated: true });
    }, 80);
    setTimeout(() => {
      scrollAgregarRef.current?.scrollToEnd({ animated: true });
    }, 240);
    setTimeout(() => {
      scrollAgregarRef.current?.scrollToEnd({ animated: true });
    }, 420);
  };

  useEffect(() => {
    if (!visible || !producto) return;
    const actual = obtenerCarritoActual();
    const sugerida = Math.max(
      1,
      producto.faltante ?? Math.max(1, producto.stock_minimo - producto.stock)
    );
    setCantidad(String(sugerida));
    setImportador(actual.importador || '');
    setEmailImportador(actual.emailImportador || '');

    void sincronizarCarritoDesdeServidor(true).then((remoto) => {
      setImportador((prev) => (prev.trim() ? prev : remoto.importador || ''));
      setEmailImportador((prev) => (prev.trim() ? prev : remoto.emailImportador || ''));
    });
  }, [visible, producto?.producto_id, producto?.codigo]);

  const confirmarAgregar = () => {
    if (!producto) return;
    const impLimpio = importador.trim();
    const mailLimpio = emailImportador.trim().toLowerCase();
    const cantNum = Number.parseInt(cantidad, 10);

    if (!impLimpio) {
      avisar('Ingresá el nombre del importador.', 'advertencia');
      return;
    }
    if (!mailLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailLimpio)) {
      avisar('Ingresá un correo electrónico válido del importador.', 'advertencia');
      return;
    }
    if (!Number.isFinite(cantNum) || cantNum <= 0) {
      avisar('Ingresá una cantidad de unidades válida mayor a cero.', 'advertencia');
      return;
    }

    Keyboard.dismiss();
    agregarProductoAlCarrito({
      producto_id: producto.producto_id,
      codigo: producto.codigo,
      categoria: producto.categoria,
      medidas: producto.medidas,
      stockActual: producto.stock,
      stockMinimo: producto.stock_minimo,
      faltante: producto.faltante,
      cantidad: cantNum,
      importador: impLimpio,
      emailImportador: mailLimpio
    });

    avisar(
      `Código ${producto.codigo} (${cantNum} u.) añadido al carrito para ${impLimpio}.`,
      'exito'
    );
    onCerrar();
    onAbrirCarrito?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 24}
        style={estiloVariables}
        className={cn(
          claseRaiz,
          'flex-1 items-center bg-black/55 p-4',
          tecladoVisible ? 'justify-start pt-3' : 'justify-center'
        )}
      >
        <View
          style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
          className="max-h-[92%] w-full max-w-md rounded-2xl border border-borde bg-superficie p-5"
        >
          <ScrollView
            ref={scrollAgregarRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{ paddingBottom: tecladoVisible ? 260 : 28 }}
            contentContainerClassName="gap-3.5"
          >
            <EncabezadoTarjeta
              titulo="Añadir al Carrito de Importadora"
              descripcion="Completá los datos del importador y las unidades a solicitar para el PDF de pedido."
              icono="cart-outline"
            />

            {producto && (
              <View
                style={{
                  backgroundColor: `${tokens.advertencia}16`,
                  borderColor: `${tokens.advertencia}55`
                }}
                className="rounded-xl border p-3"
              >
                <View className="flex-row flex-wrap items-center justify-between gap-2">
                  <Text
                    style={{ color: tokens.texto }}
                    className="text-base font-bold text-texto"
                  >
                    Código {producto.codigo}
                  </Text>
                  <Insignia
                    texto={`Alerta: Stock ${producto.stock} / Mín ${producto.stock_minimo}`}
                    tono="advertencia"
                  />
                </View>
                <Text
                  style={{ color: tokens.textoSuave }}
                  className="mt-1 text-xs text-texto-suave"
                >
                  {producto.categoria || 'Catálogo'} · Medidas: {producto.medidas || '—'}
                </Text>
              </View>
            )}

            <Entrada
              etiqueta="Importador / Empresa Proveedora *"
              icono="business-outline"
              placeholder="Ej: Importadora Principal"
              value={importador}
              onChangeText={setImportador}
            />

            <Entrada
              etiqueta="Correo electrónico (Mail) del Importador *"
              icono="mail-outline"
              placeholder="pedidos@importadora.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailImportador}
              onChangeText={setEmailImportador}
              onFocus={desplazarACantidad}
            />

            <Entrada
              etiqueta="Cantidad de unidades solicitadas *"
              icono="cube-outline"
              placeholder="Ej: 25"
              keyboardType="numeric"
              returnKeyType="done"
              value={cantidad}
              onChangeText={setCantidad}
              onFocus={desplazarACantidad}
              onSubmitEditing={confirmarAgregar}
            />

            <View className="mt-2 flex-row justify-end gap-2">
              <Boton titulo="Cancelar" variante="secundario" onPress={onCerrar} />
              <Boton
                titulo="Añadir al carrito"
                icono="cart-outline"
                onPress={confirmarAgregar}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export interface ModalCarritoImportadorProps {
  visible: boolean;
  onCerrar: () => void;
}

/**
 * Modal completo del Carrito de Pedido a Importadora: lista los productos con su código
 * y unidades solicitadas, y permite descargar el PDF y enviarlo por mail a la importadora.
 */
export function ModalCarritoImportador({ visible, onCerrar }: ModalCarritoImportadorProps) {
  const { tokens, claseRaiz, estiloVariables } = useTema();
  const { avisar, alertar } = usePopUps();
  const carrito = useCarritoImportador();
  const { servidorActivo } = useServidorNegocio();

  const [procesandoPdf, setProcesandoPdf] = useState(false);
  const [enviandoMail, setEnviandoMail] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const scrollCarritoRef = useRef<any>(null);

  const refrescarDesdeServidor = async () => {
    setSincronizando(true);
    try {
      await sincronizarCarritoDesdeServidor(true);
    } finally {
      setSincronizando(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    void refrescarDesdeServidor();
  }, [visible]);

  useEffect(() => {
    const s1 = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const s2 = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  const totalUnidades = carrito.items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);

  const ejecutarPdf = async (enviarEmail: boolean) => {
    if (enviarEmail) setEnviandoMail(true);
    else setProcesandoPdf(true);

    try {
      const resp = await generarYEnviarPdfCarrito({ enviarEmail });
      await alertar({
        titulo: enviarEmail
          ? 'PDF generado y pedido enviado a la importadora'
          : 'PDF de Orden de Compra generado',
        mensaje:
          `Orden: ${resp.ordenId}\n` +
          `Importador: ${resp.importador} (${resp.emailImportador})\n` +
          `Productos incluidos: ${resp.totalCodigos} códigos (${resp.totalUnidades} unidades solicitadas)\n` +
          `Archivo PDF: ${resp.nombreArchivo}\n` +
          (enviarEmail ? `\nEstado de envío: ${resp.correo?.detalle ?? 'Listo para enviar'}` : ''),
        tipo: 'exito'
      });
    } catch (error) {
      avisar(
        error instanceof Error ? error.message : 'No se pudo generar el PDF del carrito.',
        'peligro'
      );
    } finally {
      setProcesandoPdf(false);
      setEnviandoMail(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 24}
        style={estiloVariables}
        className={cn(
          claseRaiz,
          'flex-1 items-center bg-black/55 p-4',
          tecladoVisible ? 'justify-start pt-3' : 'justify-center'
        )}
      >
        <View
          style={{ backgroundColor: tokens.superficie, borderColor: tokens.borde }}
          className="max-h-[92%] w-full max-w-xl rounded-2xl border border-borde bg-superficie p-5"
        >
          <ScrollView
            ref={scrollCarritoRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{ paddingBottom: tecladoVisible ? 240 : 28 }}
            contentContainerClassName="gap-3.5"
          >
            <EncabezadoTarjeta
              titulo={`Carrito de Pedido a Importadora (${carrito.items.length})`}
              descripcion={`Sincronizado en vivo en ${servidorActivo.nombre} para todos los dispositivos conectados.`}
              icono="cart-outline"
              acciones={
                <BotonIcono
                  icono="refresh-outline"
                  onPress={() => void refrescarDesdeServidor()}
                  disabled={sincronizando}
                  accessibilityLabel="Sincronizar carrito desde el servidor"
                />
              }
            />

            <View className="flex-row flex-wrap gap-2.5">
              <View className="min-w-[200px] flex-1">
                <Entrada
                  etiqueta="Importador / Proveedor *"
                  icono="business-outline"
                  placeholder="Nombre de la importadora"
                  value={carrito.importador}
                  onChangeText={(t) => actualizarDatosImportadorCarrito({ importador: t })}
                />
              </View>
              <View className="min-w-[200px] flex-1">
                <Entrada
                  etiqueta="Mail de la Importadora *"
                  icono="mail-outline"
                  placeholder="pedidos@importadora.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={carrito.emailImportador}
                  onChangeText={(t) => actualizarDatosImportadorCarrito({ emailImportador: t })}
                />
              </View>
            </View>

            <Entrada
              etiqueta="Observaciones para la orden (opcional)"
              icono="document-text-outline"
              placeholder="Ej: Entrega urgente en depósito central"
              value={carrito.notas}
              onChangeText={(t) => actualizarDatosImportadorCarrito({ notas: t })}
            />

            {carrito.items.length === 0 ? (
              <View
                style={{
                  backgroundColor: tokens.superficieAlt,
                  borderColor: tokens.borde
                }}
                className="items-center rounded-xl border p-6"
              >
                <Ionicons name="cart-outline" size={32} color={tokens.textoSuave} />
                <Text
                  style={{ color: tokens.texto }}
                  className="mt-2 text-sm font-bold text-texto"
                >
                  El carrito está vacío
                </Text>
                <Text
                  style={{ color: tokens.textoSuave }}
                  className="mt-1 text-center text-xs text-texto-suave"
                >
                  Desde las alertas de bajo stock pulsá "Añadir al carrito" en los productos que necesites pedir a la importadora.
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {carrito.items.map((it) => (
                  <View
                    key={it.codigo}
                    style={{
                      backgroundColor: tokens.superficieAlt,
                      borderColor: tokens.borde
                    }}
                    className="flex-row flex-wrap items-center justify-between gap-2.5 rounded-xl border p-3"
                  >
                    <View className="min-w-[160px] flex-1">
                      <Text
                        style={{ color: tokens.texto }}
                        className="text-sm font-bold text-texto"
                      >
                        Código: {it.codigo}
                      </Text>
                      <Text
                        style={{ color: tokens.textoSuave }}
                        className="text-xs text-texto-suave"
                      >
                        {it.categoria} · {it.medidas} (Stock: {it.stockActual}/{it.stockMinimo})
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5">
                      <Boton
                        titulo="-"
                        variante="secundario"
                        tamano="sm"
                        onPress={() => cambiarCantidadItemCarrito(it.codigo, it.cantidad - 1)}
                      />
                      <View className="min-w-[64px] items-center px-2">
                        <Text
                          style={{ color: tokens.primario }}
                          className="text-sm font-bold text-primario"
                        >
                          {it.cantidad} u.
                        </Text>
                      </View>
                      <Boton
                        titulo="+"
                        variante="secundario"
                        tamano="sm"
                        onPress={() => cambiarCantidadItemCarrito(it.codigo, it.cantidad + 1)}
                      />
                      <Boton
                        titulo="Quitar"
                        icono="trash-outline"
                        variante="peligro"
                        tamano="sm"
                        onPress={() => quitarItemCarrito(it.codigo)}
                      />
                    </View>
                  </View>
                ))}

                <View
                  style={{
                    backgroundColor: `${tokens.primario}14`,
                    borderColor: `${tokens.primario}45`
                  }}
                  className="flex-row flex-wrap items-center justify-between rounded-xl border p-3"
                >
                  <Text style={{ color: tokens.texto }} className="text-xs font-bold text-texto">
                    Total códigos: {carrito.items.length}
                  </Text>
                  <Text
                    style={{ color: tokens.primario }}
                    className="text-sm font-bold text-primario"
                  >
                    Total solicitado: {totalUnidades} unidades
                  </Text>
                </View>
              </View>
            )}

            <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2">
              {carrito.items.length > 0 ? (
                <Boton
                  titulo="Vaciar carrito"
                  icono="trash-outline"
                  variante="contorno"
                  tamano="sm"
                  onPress={() => {
                    vaciarCarrito();
                    avisar('Carrito vaciado.', 'info');
                  }}
                />
              ) : (
                <View />
              )}

              <View className="flex-row flex-wrap gap-2">
                <Boton titulo="Cerrar" variante="secundario" onPress={onCerrar} />
                {carrito.items.length > 0 && (
                  <>
                    <Boton
                      titulo="Generar PDF"
                      icono="document-text-outline"
                      variante="contorno"
                      cargando={procesandoPdf}
                      onPress={() => void ejecutarPdf(false)}
                    />
                    <Boton
                      titulo="Generar PDF y Enviar a Importadora"
                      icono="send-outline"
                      variante="primario"
                      cargando={enviandoMail}
                      onPress={() => void ejecutarPdf(true)}
                    />
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
