import FormField from '../molecules/FormField.jsx';
import Button from '../atoms/Button.jsx';
import SocialLoginButton, { OAUTH_PROVIDERS } from '../molecules/SocialLoginButton.jsx';
import useForm from '../../Scripts/hooks/useForm.js';
import useAuth from '../../Scripts/hooks/useAuth.js';
import useNotification from '../../Scripts/hooks/useNotification.js';
import { isEmail, isValidPassword, normalizeError } from '../../Scripts/utils/validators.js';

/**
 * Organismo: LoginForm — login email/password + OAuth.
 * @param {object} props
 * @param {()=>void} props.onRegisteredClick  Navegar al registro
 * @param {(path:string)=>void} [props.navigate] Navegación a inyectar (usada por sistema B y sistema A)
 */
export default function LoginForm({ onRegisteredClick, navigate }) {
  const { login, loginWithProvider } = useAuth();
  const { success, error: notifyError } = useNotification();

  const { values, errors, submitting, handleChange, handleSubmit, setFieldError, setErrors } = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (!v ? 'Ingresá tu email' : !isEmail(v) ? 'Email inválido' : undefined),
      password: (v) => (!v ? 'Ingresá tu contraseña' : !isValidPassword(v) ? 'Contraseña inválida' : undefined),
    },
    onSubmit: async (values) => {
      try {
        const data = await login(values);
        if (data?.ok) {
          success('Bienvenido de nuevo');
          navigate?.('/dashboard');
        } else {
          notifyError(data?.error || 'No se pudo iniciar sesión');
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
        <h2 className="text-3xl font-bold text-balance mb-2">Iniciar sesión</h2>
        <p className="mb-0">Ingresá con tu cuenta o usa un proveedor social.</p>
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

      <FormField
        id="login-email"
        name="email"
        type="email"
        label="Email"
        required
        placeholder="tu@correo.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        autoFocus
      />
      <FormField
        id="login-password"
        name="password"
        type="password"
        label="Contraseña"
        required
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
        helper="Mínimo 8 caracteres, al menos una letra y un número."
      />

      <Button type="submit" loading={submitting} fullWidth size="lg" className="mt-2">
        Ingresar
      </Button>

      <p className="text-center text-sm mt-5 mb-0">
        ¿Todavía no tenés cuenta?{' '}
        <button
          type="button"
          className="link"
          onClick={() => onRegisteredClick?.()}
        >
          Crear cuenta
        </button>
      </p>
    </form>
  );
}
