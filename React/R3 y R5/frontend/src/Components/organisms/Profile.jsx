import { useEffect, useState } from 'react';
import FormField from '../molecules/FormField.jsx';
import Button from '../atoms/Button.jsx';
import useAuth from '../../Scripts/hooks/useAuth.js';
import useNotification from '../../Scripts/hooks/useNotification.js';
import useForm from '../../Scripts/hooks/useForm.js';
import authService from '../../Scripts/services/authService.js';
import { isValidDisplayName, normalizeError } from '../../Scripts/utils/validators.js';
import Modal from '../molecules/Modal.jsx';
import Icon from '../atoms/Icon.jsx';
import { formatDate, getInitials } from '../../Scripts/utils/helpers.js';

/**
 * Organismo: Profile — edición de datos + cambio de contraseña + logout global.
 */
export default function Profile() {
  const { user, updateUser, logout, logoutAll } = useAuth();
  const { success, error: notifyError, warning } = useNotification();
  const [meta, setMeta] = useState(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  const profileForm = useForm({
    initialValues: { displayName: user?.displayName || '', username: user?.username || '' },
    validate: {
      displayName: (v) => (!v ? 'Nombre requerido' : !isValidDisplayName(v) ? 'Mínimo 2 caracteres' : undefined),
      username: (v) => (v && v.length > 0 && !/^[A-Za-z0-9_-]{3,50}$/.test(v)
        ? '3-50 caracteres alfanuméricos, _ o -'
        : undefined),
    },
    onSubmit: async (values) => {
      try {
        const data = await authService.updateMe({
          displayName: values.displayName,
          username: values.username || null,
        });
        if (data?.ok) {
          updateUser(data.user);
          success('Perfil actualizado');
        }
      } catch (e) {
        const ne = normalizeError(e);
        if (ne.fields) profileForm.setErrors(ne.fields);
        notifyError(ne.message);
      }
    },
  });

  const passwordForm = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      currentPassword: (v) => (!v ? 'Ingresá tu contraseña actual' : undefined),
      newPassword: (v) => {
        if (!v) return 'Nueva contraseña requerida';
        if (v.length < 8 || v.length > 128) return '8-128 caracteres';
        if (!/[A-Za-z]/.test(v)) return 'Incluir al menos una letra';
        if (!/[0-9]/.test(v)) return 'Incluir al menos un número';
        return undefined;
      },
      confirmPassword: (v, all) => (!v ? 'Confirmala' : v !== all.newPassword ? 'No coinciden' : undefined),
    },
    onSubmit: async (values, helpers) => {
      try {
        const data = await authService.changePassword(values);
        if (data?.ok) {
          success('Contraseña actualizada');
          helpers.reset();
        }
      } catch (e) {
        const ne = normalizeError(e);
        if (ne.fields) passwordForm.setErrors(ne.fields);
        notifyError(ne.message);
      }
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.getMe();
        if (!cancelled && res?.ok) {
          setMeta({
            createdAt: res.user.createdAt,
            updatedAt: res.user.updatedAt,
            linkedAccounts: res.linkedAccounts,
          });
          profileForm.setField('displayName', res.user.displayName || '');
          profileForm.setField('username', res.user.username || '');
        }
      } catch (_e) { /* ignore */ }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-6">
        <div
          className="w-24 h-24 rounded-full text-3xl font-bold flex items-center justify-center text-white shadow-warm"
          style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user?.displayName)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-1">Mi perfil</h1>
          <p className="text-[color:var(--text-secondary)] mb-1 break-all">
            <Icon name="mail" size={14} className="inline -mt-0.5 mr-1" />
            {user?.email}
          </p>
          {meta && (
            <small className="text-[color:var(--text-muted)]">
              Miembro desde {formatDate(meta.createdAt)} · Última actualización {formatDate(meta.updatedAt)}
            </small>
          )}
        </div>
      </section>

      <div className="row g-6">
        <div className="col-12 col-lg-7">
          <section className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Información pública</h3>
            <form onSubmit={profileForm.handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormField
                    id="p-name" name="displayName" label="Nombre visible" required
                    value={profileForm.values.displayName}
                    onChange={profileForm.handleChange}
                    error={profileForm.errors.displayName}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormField
                    id="p-user" name="username" label="Username"
                    value={profileForm.values.username}
                    onChange={profileForm.handleChange}
                    error={profileForm.errors.username}
                    helper="Opcional. 3-50 caracteres alfanuméricos, _ o -"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button type="submit" loading={profileForm.submitting}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </section>
        </div>

        <div className="col-12 col-lg-5">
          <section className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Cambiar contraseña</h3>
            <form onSubmit={passwordForm.handleSubmit} noValidate>
              <FormField
                id="p-pass-cur" name="currentPassword" type="password" label="Contraseña actual"
                value={passwordForm.values.currentPassword}
                onChange={passwordForm.handleChange}
                error={passwordForm.errors.currentPassword}
                autoComplete="current-password"
              />
              <FormField
                id="p-pass-new" name="newPassword" type="password" label="Nueva contraseña"
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                error={passwordForm.errors.newPassword}
                autoComplete="new-password"
                helper="8-128 caracteres, al menos 1 letra y 1 número."
              />
              <FormField
                id="p-pass-confirm" name="confirmPassword" type="password" label="Confirmar"
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                error={passwordForm.errors.confirmPassword}
                autoComplete="new-password"
              />
              <div className="flex justify-end mt-1">
                <Button type="submit" loading={passwordForm.submitting}>Cambiar contraseña</Button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Sesiones</h3>
            <p className="mb-0">Tu refresh token se almacena en una cookie httpOnly (imposible de leer por JS).</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => logout().then(() => success('Sesión cerrada'))}>
              <Icon name="logout" size={16} />
              Cerrar esta sesión
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                warning('Esto cerrará sesión en TODOS tus dispositivos.');
                setLogoutAllOpen(true);
              }}
            >
              Cerrar todas las sesiones
            </Button>
          </div>
        </div>
      </section>

      <Modal
        open={logoutAllOpen}
        onClose={() => setLogoutAllOpen(false)}
        title="Cerrar todas las sesiones"
        subtitle="Revocaremos todos los refresh tokens activos en la base de datos."
        footer={
          <>
            <Button variant="ghost" onClick={() => setLogoutAllOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => {
              logoutAll().then(() => success('Todas las sesiones cerradas'));
              setLogoutAllOpen(false);
            }}>Confirmar</Button>
          </>
        }
      >
        <p className="mb-0">
          Vas a tener que volver a iniciar sesión en todos tus dispositivos. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
