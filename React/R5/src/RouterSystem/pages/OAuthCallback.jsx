import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiAlertCircle, FiMail } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import Button from '../../Components/Button.jsx';
import Card from '../../Components/Card.jsx';
import FormWrapper from '../../Components/FormWrapper.jsx';
import Input from '../../Components/Input.jsx';
import Spinner from '../../Components/Spinner.jsx';
import ThemeToggle from '../../Components/ThemeToggle.jsx';
import { getProviderName } from '../../Scripts/config/oauthProviders.js';
import { useOAuthCallback } from '../../Scripts/hooks/useOAuthCallback.js';
import { emailField } from '../../Scripts/utils/validators.js';

/**
 * Formulario que se muestra cuando el proveedor no entregó un email
 * (ej: una cuenta de GitHub con el email privado). Hasta completarlo, el
 * código temporal no se consume.
 */
function NeedsEmailForm({ profile, onSubmit, submitting, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  return (
    <FormWrapper
      title="Falta un dato"
      subtitle={`${getProviderName(profile?.provider)} no nos dio tu email. Lo necesitamos para crear la cuenta.`}
      error={error}
      onSubmit={handleSubmit(({ email }) => onSubmit(email))}
    >
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        leadingIcon={<FiMail />}
        error={errors.email?.message}
        {...register('email', emailField)}
      />

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Crear mi cuenta
      </Button>
    </FormWrapper>
  );
}

/**
 * Retorno del flujo OAuth del Sistema A (/auth/callback).
 *
 * Mientras el backend resuelve el login, se muestra una pantalla de espera:
 * la aplicación "no suelta la página" hasta que el proveedor está aprobado y
 * el código temporal se canjea por la sesión. Recién entonces se entra al panel.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { status, error, pendingProfile, completeEmail } = useOAuthCallback();
  const [submittingEmail, setSubmittingEmail] = useState(false);

  /* Aprobado: se libera la aplicación y se entra al panel. */
  useEffect(() => {
    if (status === 'success') {
      navigate('/dashboard', { replace: true });
    }
  }, [status, navigate]);

  const handleEmail = async (email) => {
    setSubmittingEmail(true);
    await completeEmail(email);
    setSubmittingEmail(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold text-ink">user-auth-system</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md animate-pop-in">
          <Card>
            {(status === 'idle' || status === 'processing' || status === 'success') && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <Spinner size="lg" label="Completando el inicio de sesión" />
                <div>
                  <h1 className="text-lg font-semibold text-ink">
                    Completando el inicio de sesión…
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    No cierres esta ventana. Te llevamos al panel en un instante.
                  </p>
                </div>
              </div>
            )}

            {status === 'needs_email' && (
              <NeedsEmailForm
                profile={pendingProfile}
                onSubmit={handleEmail}
                submitting={submittingEmail}
                error={error}
              />
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-5 py-2 text-center">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-xl text-danger"
                >
                  <FiAlertCircle />
                </span>
                <div>
                  <h1 className="text-lg font-semibold text-ink">
                    No pudimos iniciar sesión
                  </h1>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{error}</p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Link to="/login" className="w-full">
                    <Button size="lg" fullWidth>
                      Volver al inicio de sesión
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button variant="ghost" size="md" fullWidth>
                      Crear una cuenta con email
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
