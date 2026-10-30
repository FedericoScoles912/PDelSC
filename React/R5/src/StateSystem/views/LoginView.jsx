import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail } from 'react-icons/fi';

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
import { emailField, loginPasswordField } from '../../Scripts/utils/validators.js';
import { VIEWS } from '../navigation.js';

/**
 * Login del Sistema B. Misma API y mismos componentes que el Sistema A, pero
 * sin rutas: al terminar se cambia de vista llamando a navigate().
 */
export default function LoginView({ navigate }) {
  const { login, loginWithProvider } = useAuth();
  const { notify } = useNotice();

  const [busyProvider, setBusyProvider] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const user = await login(values);
      notify({ type: 'success', message: `¡Hola de nuevo, ${user.name}!` });
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
        title="Iniciá sesión"
        subtitle="Entrá con una cuenta social o con tu email y contraseña."
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
            Redirigiendo a {getProviderName(busyProvider)}…
          </p>
        )}

        <Divider label="o continuá con email" />

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
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', loginPasswordField)}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting} disabled={isBusy}>
          Ingresar
        </Button>

        <p className="text-center text-sm text-muted">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate(VIEWS.REGISTER)}
            className="font-semibold text-primary hover:underline"
          >
            Creá una
          </button>
        </p>
      </FormWrapper>
    </Card>
  );
}
