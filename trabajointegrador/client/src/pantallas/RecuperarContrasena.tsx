/**
 * @file Panel de recuperación de acceso: pide el correo, envía un código de 6 dígitos
 *       por Gmail y permite iniciar sesión con ese código.
 * @module client/src/pantallas/RecuperarContrasena
 */

import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { usePopUps } from '../componentes/popups/PopUpsProvider';
import { Boton } from '../componentes/ui/Boton';
import { Entrada } from '../componentes/ui/Entrada';
import { iniciarSesionConCodigo } from '../estado/sesionSlice';
import { useDespacho } from '../estado/store';
import { peticion } from '../servicios/api';
import { useTema } from '../tema/TemaProvider';

interface Props {
  /** Correo precargado desde el formulario de acceso. */
  emailInicial?: string;
  /** Vuelve al formulario de acceso normal. */
  onVolver: () => void;
}

/** Flujo de dos pasos: correo → código. */
export function RecuperarContrasena({ emailInicial = '', onVolver }: Props) {
  const { tokens } = useTema();
  const despachar = useDespacho();
  const { avisar } = usePopUps();

  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo');
  const [email, setEmail] = useState(emailInicial);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return undefined;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const solicitar = async () => {
    const correo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('Ingresá un correo válido.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const r = await peticion<{ esperaSegundos: number }>('/auth/recuperar/solicitar', {
        metodo: 'POST',
        autenticada: false,
        cuerpo: { email: correo }
      });
      setEmail(correo);
      setPaso('codigo');
      setCodigo('');
      setEspera(r.esperaSegundos ?? 45);
      avisar(`Si el correo existe, te enviamos un código a ${correo}.`, 'exito');
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo enviar el código.', 'peligro');
    } finally {
      setEnviando(false);
    }
  };

  const verificar = async () => {
    if (!/^\d{6}$/.test(codigo.trim())) {
      setError('El código tiene 6 dígitos.');
      return;
    }
    setError(null);
    setEnviando(true);
    const resultado = await despachar(
      iniciarSesionConCodigo({ email: email.trim(), codigo: codigo.trim() })
    );
    setEnviando(false);
    if (iniciarSesionConCodigo.rejected.match(resultado)) {
      setError(resultado.payload ?? 'El código es inválido o venció.');
    }
  };

  return (
    <View className="gap-4">
      <Text style={{ color: tokens.texto }} className="text-lg font-bold text-texto">
        Recuperar contraseña
      </Text>

      {paso === 'correo' ? (
        <>
          <Text style={{ color: tokens.textoSuave }} className="text-sm text-texto-suave">
            Ingresá tu correo y te enviaremos un código para iniciar sesión.
          </Text>
          <Entrada
            etiqueta="Correo electrónico"
            icono="mail-outline"
            placeholder="tu@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            error={error ?? undefined}
            onChangeText={(v) => {
              setEmail(v);
              setError(null);
            }}
            onSubmitEditing={() => void solicitar()}
          />
          <Boton
            titulo="Enviar código"
            icono="send-outline"
            anchoCompleto
            cargando={enviando}
            onPress={() => void solicitar()}
          />
        </>
      ) : (
        <>
          <Text style={{ color: tokens.textoSuave }} className="text-sm text-texto-suave">
            Revisá tu Gmail ({email}) e ingresá el código de 6 dígitos. Vence en 10 minutos.
          </Text>
          <Entrada
            etiqueta="Código"
            icono="key-outline"
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={codigo}
            error={error ?? undefined}
            onChangeText={(v) => {
              setCodigo(v.replace(/\D/g, ''));
              setError(null);
            }}
            onSubmitEditing={() => void verificar()}
          />
          <Boton
            titulo="Ingresar con código"
            icono="log-in-outline"
            anchoCompleto
            cargando={enviando}
            onPress={() => void verificar()}
          />
          <Boton
            titulo={espera > 0 ? `Reenviar código (${espera}s)` : 'Reenviar código'}
            variante="secundario"
            anchoCompleto
            deshabilitado={espera > 0 || enviando}
            onPress={() => void solicitar()}
          />
        </>
      )}

      <Pressable onPress={onVolver} className="items-center pt-1">
        <Text style={{ color: tokens.primario }} className="text-sm font-semibold text-primario">
          Volver a iniciar sesión
        </Text>
      </Pressable>
    </View>
  );
}
