import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiUser } from 'react-icons/fi';

import Button from '../../Components/Button.jsx';
import Card from '../../Components/Card.jsx';
import Divider from '../../Components/Divider.jsx';
import FormWrapper from '../../Components/FormWrapper.jsx';
import Input from '../../Components/Input.jsx';
import SocialButtonGroup from '../../Components/SocialButtonGroup.jsx';
import { LOGIN_PROVIDER_IDS, getProviderName } from '../../Scripts/config/oauthProviders.js';
import { useAuth } from '../../Scripts/hooks/useAuth.js';
import { useNotice } from '../../Scripts/hooks/useNotice.js';
import { SYSTEMS } from '../../Scripts/utils/constants.js';
import {
  confirmPasswordField,
  emailField,
  nameField,
  passwordField,
} from '../../Scripts/utils/validators.js';
import { VIEWS } from '../navigation.js';

/** Registro del Sistema B (vista controlada por estado, sin rutas). */
export default function RegisterView({ navigate }) {
  const { register: registerUser, loginWithProvider } = useAuth();
  const { notify } = useNotice();

  const [busyProvider, setBusyProvider] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const user = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      notify({ type: 'success', message: `¡Bienvenido, ${user.name}! Tu cuenta está lista.` });
      navigate(VIEWS.DASHBOARD);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvider = (providerId) => {
    setBusyProvider(providerId);
    loginWithProvider(providerId, SYSTEMS.STATE);
  };

  const isBusy = submitting || Boolean(busyProvider);

  return (
    <Card>
      <FormWrapper
        title="Creá tu cuenta"
        subtitle="Con email y contraseña, o en un paso con una cuenta social."
        error={formError}
        onSubmit={handleSubmit(onSubmit)}
      >
        <SocialButtonGroup
          providers={LOGIN_PROVIDER_IDS}
          columns={3}
          onSelect={handleProvider}
          busyProvider={busyProvider}
          disabled={isBusy}
        />

        {busyProvider && (
          <p className="text-center text-sm text-muted" role="status">
            Continuando con {getProviderName(busyProvider)}…
          </p>
        )}

        <Divider label="o registrate con email" />

        <Input
          label="Nombre"
          autoComplete="name"
          placeholder="Ada Lovelace"
          leadingIcon={<FiUser />}
          error={errors.name?.message}
          {...register('name', nameField)}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          leadingIcon={<FiMail />}
          error={errors.email?.message}
          {...register('email', emailField)}
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres, con al menos una letra y un número."
          error={errors.password?.message}
          {...register('password', passwordField)}
        />

        <Input
          label="Repetí la contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', confirmPasswordField(getValues))}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting} disabled={isBusy}>
          Crear cuenta
        </Button>

        <p className="text-center text-sm text-muted">
          ¿Ya tenés cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate(VIEWS.LOGIN)}
            className="font-semibold text-primary hover:underline"
          >
            Iniciá sesión
          </button>
        </p>
      </FormWrapper>
    </Card>
  );
}
