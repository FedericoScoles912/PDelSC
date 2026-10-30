import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiInfo, FiLock, FiMail, FiUser } from 'react-icons/fi';

import Button from '../../Components/Button.jsx';
import Card from '../../Components/Card.jsx';
import Divider from '../../Components/Divider.jsx';
import FormWrapper from '../../Components/FormWrapper.jsx';
import Input from '../../Components/Input.jsx';
import ProviderBadge from '../../Components/ProviderBadge.jsx';
import { LOGIN_PROVIDER_IDS, getProviderName } from '../../Scripts/config/oauthProviders.js';
import { useAuth } from '../../Scripts/hooks/useAuth.js';
import { useNotice } from '../../Scripts/hooks/useNotice.js';
import { oauthService } from '../../Scripts/services/oauthService.js';
import { userService } from '../../Scripts/services/userService.js';
import { SYSTEMS } from '../../Scripts/utils/constants.js';
import { formatDate, getInitials, goTo } from '../../Scripts/utils/helpers.js';
import {
  avatarUrlField,
  nameField,
  optionalPasswordField,
} from '../../Scripts/utils/validators.js';

/**
 * Perfil del Sistema B. Igual que el del Sistema A salvo dos diferencias:
 * la vinculación pide volver al Sistema B (system=state) y la vista inicial
 * se deduce de la URL al montar, porque acá no hay rutas.
 */
export default function ProfileView() {
  const {
    user,
    linkedAccounts,
    hasPassword,
    refreshLinkedAccounts,
    requestProviderLink,
    unlinkProvider,
    updateUser,
  } = useAuth();
  const { notify, confirm } = useNotice();

  const [busyProvider, setBusyProvider] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      avatar_url: user?.avatar_url ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const linkedIds = useMemo(
    () => new Set(linkedAccounts.map((account) => account.provider)),
    [linkedAccounts]
  );

  /* Refresca las cuentas y procesa el retorno de la vinculación (?linked / ?code). */
  useEffect(() => {
    void refreshLinkedAccounts();

    const params = new URLSearchParams(window.location.search);
    const linked = params.get('linked');
    const code = params.get('code');
    if (!linked && !code) return;

    const url = new URL(window.location.href);
    ['linked', 'code', 'error', 'error_description', 'state'].forEach((key) =>
      url.searchParams.delete(key)
    );
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

    if (linked) {
      notify({ type: 'success', message: `Vinculaste tu cuenta de ${getProviderName(linked)}.` });
      return;
    }

    oauthService.exchange(code).catch((exchangeError) => {
      notify({ type: 'error', message: exchangeError.message });
    });
  }, [notify, refreshLinkedAccounts]);

  const onSubmit = async (values) => {
    setSaving(true);
    setFormError(null);
    try {
      const { user: updated } = await userService.updateProfile({
        name: values.name,
        avatar_url: values.avatar_url,
        password: values.password,
      });
      updateUser(updated);
      reset({
        name: updated.name ?? '',
        avatar_url: updated.avatar_url ?? '',
        password: '',
        confirmPassword: '',
      });
      notify({ type: 'success', message: 'Perfil actualizado.' });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLink = async (providerId) => {
    setBusyProvider(providerId);
    try {
      const authUrl = await requestProviderLink(providerId, SYSTEMS.STATE);
      goTo(authUrl);
    } catch (error) {
      setBusyProvider(null);
      notify({ type: 'error', message: error.message });
    }
  };

  const handleUnlink = async (providerId) => {
    const accepted = await confirm({
      title: 'Desvincular cuenta',
      message: `¿Seguro que querés desvincular tu cuenta de ${getProviderName(providerId)}?`,
      confirmText: 'Desvincular',
      destructive: true,
    });
    if (!accepted) return;

    setBusyProvider(providerId);
    try {
      await unlinkProvider(providerId);
      notify({ type: 'success', message: `Cuenta de ${getProviderName(providerId)} desvinculada.` });
    } catch (error) {
      notify({ type: 'error', message: error.message });
    } finally {
      setBusyProvider(null);
    }
  };

  const blocksUnlink = (providerId) =>
    !hasPassword && linkedAccounts.length === 1 && linkedIds.has(providerId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
              {getInitials(user?.name)}
            </span>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-ink">{user?.name}</h1>
            <p className="truncate text-sm text-muted">{user?.email}</p>
            <p className="mt-0.5 text-xs text-muted">
              Cuenta creada el {formatDate(user?.created_at)}
            </p>
          </div>

          <span
            className={
              hasPassword
                ? 'ml-auto rounded-full bg-olive/15 px-3 py-1 text-xs font-medium text-olive'
                : 'ml-auto rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-ink'
            }
          >
            {hasPassword ? 'Con contraseña' : 'Solo acceso social'}
          </span>
        </div>
      </Card>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <Card className="h-full">
            <FormWrapper
              title="Datos de la cuenta"
              subtitle="Actualizá tu nombre, tu avatar o definí una contraseña."
              error={formError}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                label="Nombre"
                autoComplete="name"
                leadingIcon={<FiUser />}
                error={errors.name?.message}
                {...register('name', nameField)}
              />

              <Input
                label="Email"
                leadingIcon={<FiMail />}
                value={user?.email ?? ''}
                readOnly
                disabled
                hint="El email de la cuenta no se puede cambiar desde acá."
              />

              <Input
                label="URL del avatar"
                placeholder="https://…"
                error={errors.avatar_url?.message}
                {...register('avatar_url', avatarUrlField)}
              />

              <Divider />

              <Input
                label="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                leadingIcon={<FiLock />}
                hint={
                  hasPassword
                    ? 'Dejala en blanco para mantener la actual.'
                    : 'Todavía no tenés contraseña: definí una para poder entrar con email.'
                }
                error={errors.password?.message}
                {...register('password', optionalPasswordField)}
              />

              <Input
                label="Repetí la nueva contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  deps: ['password'],
                  validate: (value) =>
                    value === getValues('password') || 'Las contraseñas no coinciden.',
                })}
              />

              <Button type="submit" fullWidth loading={saving}>
                Guardar cambios
              </Button>
            </FormWrapper>
          </Card>
        </div>

        <div className="col-12 col-lg-6">
          <Card className="h-full">
            <header className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-ink">Cuentas vinculadas</h2>
              <p className="text-sm text-muted">
                Entrá con cualquiera de estas cuentas y llegarás al mismo perfil.
              </p>
            </header>

            <div className="flex flex-col gap-3">
              {LOGIN_PROVIDER_IDS.map((providerId) => (
                <ProviderBadge
                  key={providerId}
                  provider={providerId}
                  linked={linkedIds.has(providerId)}
                  busy={busyProvider === providerId}
                  disabled={blocksUnlink(providerId)}
                  disabledHint="Definí una contraseña antes de desvincular tu única forma de acceso."
                  onLink={handleLink}
                  onUnlink={handleUnlink}
                />
              ))}
            </div>

            {!hasPassword && linkedAccounts.length === 1 && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface-alt px-4 py-3 text-xs leading-relaxed text-muted">
                <FiInfo aria-hidden="true" className="mt-0.5 shrink-0" />
                <span>
                  Esta es tu única forma de acceso. Definí una contraseña en el formulario para
                  poder desvincularla.
                </span>
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
