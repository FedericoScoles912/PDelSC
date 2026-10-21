/**
 * LoginScreen.js
 * Inicio de sesión con email + contraseña, y accesos sociales.
 */
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '../Components/atoms/Text';
import { Card } from '../Components/atoms/Card';
import { Button } from '../Components/atoms/Button';
import { FormField } from '../Components/molecules/FormField';
import { Divider } from '../Components/atoms/Divider';
import { login, clearError } from '../Store/slices/authSlice';
import { useFeedback } from '../Components/organisms/FeedbackProvider';

export function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const { toast } = useFeedback();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (error) setFormError(error);
  }, [error]);

  const onSubmit = async () => {
    setFormError('');
    dispatch(clearError());
    if (!email.trim() || !password) {
      setFormError('Ingresá tu email y contraseña');
      return;
    }
    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
      toast({ message: '¡Bienvenido!', tone: 'success' });
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
        <View className="mx-auto w-full max-w-[420px]">
          {/* Marca */}
          <View className="mb-6 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
              <Text className="text-2xl font-bold text-white">R</Text>
            </View>
            <Text variant="h1">Retenes EMIC</Text>
            <Text muted className="mt-1">Sistema de Control de Stock</Text>
          </View>

          <Card>
            <Text variant="h3" className="mb-4">Iniciar sesión</Text>

            <FormField
              label="Email"
              required
              leftIcon="user"
              value={email}
              onChangeText={setEmail}
              placeholder="usuario@retenes.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <FormField
              label="Contraseña"
              required
              leftIcon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              onSubmitEditing={onSubmit}
            />

            {formError ? (
              <Text variant="caption" className="mb-2 text-danger">{formError}</Text>
            ) : null}

            <Button
              label="Ingresar"
              fullWidth
              loading={status === 'loading'}
              onPress={onSubmit}
              className="mt-1"
            />

            <View className="my-4 flex-row items-center gap-3">
              <Divider className="flex-1" />
              <Text variant="caption" muted>o continuá con</Text>
              <Divider className="flex-1" />
            </View>

            <View className="flex-row gap-2">
              <Button variant="secondary" className="flex-1" label="Google" disabled />
              <Button variant="secondary" className="flex-1" label="GitHub" disabled />
            </View>
            <Text variant="caption" muted className="mt-2 text-center">
              El inicio social requiere configurar las credenciales OAuth del backend.
            </Text>
          </Card>

          <Pressable onPress={() => navigation.navigate('Register')} className="mt-5 items-center">
            <Text variant="label" className="text-brand-700 dark:text-brand-300">
              ¿No tenés cuenta? Registrate
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
