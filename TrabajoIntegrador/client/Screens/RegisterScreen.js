/**
 * RegisterScreen.js
 * Alta de usuario (rol por defecto: Vendedor, definido en el backend).
 */
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { FormField } from '../Components/molecules/FormField';
import { register, clearError } from '../Store/slices/authSlice';
import { useFeedback } from '../Components/organisms/FeedbackProvider';

export function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const { toast } = useFeedback();

  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', repetir: '' });
  const [formError, setFormError] = useState('');

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (error) setFormError(error);
  }, [error]);

  const onSubmit = async () => {
    setFormError('');
    dispatch(clearError());

    if (!form.nombre.trim() || !form.email.trim() || !form.password) {
      setFormError('Completá nombre, email y contraseña');
      return;
    }
    if (form.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (form.password !== form.repetir) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    try {
      await dispatch(register({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
      })).unwrap();
      toast({ message: 'Cuenta creada correctamente', tone: 'success' });
    } catch {
      /* el error ya se refleja en el estado */
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-warm-50 dark:bg-warm-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="mx-auto w-full max-w-[460px]">
          <Card>
            <Text variant="h3" className="mb-4">Crear cuenta</Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField label="Nombre" required value={form.nombre} onChangeText={set('nombre')} placeholder="Juan" />
              </View>
              <View className="flex-1">
                <FormField label="Apellido" value={form.apellido} onChangeText={set('apellido')} placeholder="Pérez" />
              </View>
            </View>

            <FormField
              label="Email"
              required
              leftIcon="user"
              value={form.email}
              onChangeText={set('email')}
              placeholder="usuario@retenes.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <FormField
              label="Contraseña"
              required
              leftIcon="lock"
              value={form.password}
              onChangeText={set('password')}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              help="Al menos 8 caracteres, con mayúscula y número."
            />
            <FormField
              label="Repetir contraseña"
              required
              leftIcon="lock"
              value={form.repetir}
              onChangeText={set('repetir')}
              placeholder="Repetí la contraseña"
              secureTextEntry
              onSubmitEditing={onSubmit}
            />

            {formError ? <Text variant="caption" className="mb-2 text-danger">{formError}</Text> : null}

            <Button label="Registrarme" fullWidth loading={status === 'loading'} onPress={onSubmit} />
          </Card>

          <Pressable onPress={() => navigation.goBack()} className="mt-5 items-center">
            <Text variant="label" className="text-brand-700 dark:text-brand-300">
              Ya tengo cuenta — Volver al inicio de sesión
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default RegisterScreen;
