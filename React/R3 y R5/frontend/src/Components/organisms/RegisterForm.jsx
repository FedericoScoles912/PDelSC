import FormField from '../molecules/FormField.jsx';
import Button from '../atoms/Button.jsx';
import SocialLoginButton, { OAUTH_PROVIDERS } from '../molecules/SocialLoginButton.jsx';
import useForm from '../../Scripts/hooks/useForm.js';
import useAuth from '../../Scripts/hooks/useAuth.js';
import useNotification from '../../Scripts/hooks/useNotification.js';
import { isEmail, isValidPassword, isValidDisplayName, normalizeError } from '../../Scripts/utils/validators.js';

/**
 * Organismo: RegisterForm.
 */
export default function RegisterForm({ onLoginClick, navigate }) {
  const { register, loginWithProvider } = useAuth();
  const { success, error: notifyError } = useNotification();

  const { values, errors, submitting, handleChange, handleSubmit, setErrors } = useForm({
    initialValues: {
      displayName: '', username: '', email: '',
      password: '', confirmPassword: '',
    },
    validate: {
      displayName: (v) => (!v ? 'Ingresá tu nombre' : !isValidDisplayName(v) ? 'Mínimo 2 caracteres' : undefined),
      username: (v) => (v && v.length > 0 && !/^[A-Za-z0-9_-]{3,50}$/.test(v)
        ? '3-50 caracteres alfanuméricos, _ o -'
        : undefined),
      email: (v) => (!v ? 'Ingresá tu email' : !isEmail(v) ? 'Email inválido' : undefined),
      password: (v) => (!v ? 'Ingresá una contraseña' : !isValidPassword(v) ? 'Mínimo 8 caracteres, 1 letra y 1 número' : undefined),
      confirmPassword: (v, all) => (!v ? 'Confirmá la contraseña' : v !== all.password ? 'No coinciden' : undefined),
    },
    onSubmit: async (values) => {
      try {
        const data = await register(values);
        if (data?.ok) {
          success('Cuenta creada correctamente');
          navigate?.('/dashboard');
        } else {
          notifyError(data?.error || 'No se pudo crear la cuenta');
        }
      } catch (e) {
        const normalized = normalizeError(e);
        if (normalized.fields) setErrors(normalized.fields);
        notifyError(normalized.message);
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-balance mb-2">Crear cuenta</h2>
        <p className="mb-0">Completá tus datos para comenzar.</p>
      </div>

      <div className="grid gap-2 mb-5">
        {OAUTH_PROVIDERS.map((p) => (
          <SocialLoginButton
            key={p}
            provider={p}
            onClick={() => loginWithProvider(p, '/dashboard')}
          />
        ))}
      </div>

      <div className="divider"><span className="chip">o con email</span></div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <FormField
            id="reg-name" name="displayName" label="Nombre" required
            placeholder="Tu nombre visible"
            value={values.displayName} onChange={handleChange} error={errors.displayName}
            autoFocus
          />
        </div>
        <div className="col-12 col-md-6">
          <FormField
            id="reg-user" name="username" label="Username"
            placeholder="usuario_1 (opcional)"
            value={values.username || ''} onChange={handleChange} error={errors.username}
          />
        </div>
      </div>

      <FormField
        id="reg-email" name="email" type="email" label="Email" required
        placeholder="tu@correo.com"
        value={values.email} onChange={handleChange} error={errors.email}
        autoComplete="email"
      />

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <FormField
            id="reg-pass" name="password" type="password" label="Contraseña" required
            placeholder="••••••••"
            value={values.password} onChange={handleChange} error={errors.password}
            autoComplete="new-password"
          />
        </div>
        <div className="col-12 col-md-6">
          <FormField
            id="reg-pass2" name="confirmPassword" type="password" label="Confirmar contraseña" required
            placeholder="••••••••"
            value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" loading={submitting} fullWidth size="lg" className="mt-3">
        Crear mi cuenta
      </Button>

      <p className="text-center text-sm mt-5 mb-0">
        ¿Ya tenés cuenta?{' '}
        <button type="button" className="link" onClick={() => onLoginClick?.()}>
          Iniciar sesión
        </button>
      </p>
    </form>
  );
}
