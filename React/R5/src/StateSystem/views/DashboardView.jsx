import { FiArrowRight, FiLink, FiShield, FiUser } from 'react-icons/fi';

import Button from '../../Components/Button.jsx';
import Card from '../../Components/Card.jsx';
import { LOGIN_PROVIDER_IDS, getProviderName } from '../../Scripts/config/oauthProviders.js';
import { useAuth } from '../../Scripts/hooks/useAuth.js';
import { formatDate } from '../../Scripts/utils/helpers.js';
import { VIEWS } from '../navigation.js';

/** Tarjeta de dato simple, usada en la fila de resumen. */
function StatCard({ label, value, hint }) {
  return (
    <Card variant="muted" className="h-full">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

/** Panel del Sistema B: misma información que el Sistema A, sin rutas. */
export default function DashboardView({ navigate }) {
  const { user, linkedAccounts, hasPassword } = useAuth();

  const linkedNames = linkedAccounts
    .filter((account) => LOGIN_PROVIDER_IDS.includes(account.provider))
    .map((account) => getProviderName(account.provider));

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink">Hola, {firstName}</h1>
        <p className="text-sm text-muted">
          Esta es tu sesión en el sistema de autenticación, navegando por estado interno en lugar
          de por rutas.
        </p>
      </header>

      <div className="row g-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <StatCard label="Estado de la sesión" value="Activa" hint="JWT guardado en el navegador" />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <StatCard
            label="Cuentas vinculadas"
            value={`${linkedNames.length} de ${LOGIN_PROVIDER_IDS.length}`}
            hint={linkedNames.length ? linkedNames.join(', ') : 'Ninguna todavía'}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <StatCard
            label="Acceso con email"
            value={hasPassword ? 'Habilitado' : 'Sin contraseña'}
            hint={hasPassword ? 'Podés entrar con email y contraseña' : 'Solo cuentas sociales'}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <Card className="h-full">
            <header className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-ink">Tu cuenta</h2>
              <p className="text-sm text-muted">Datos guardados en la base de datos.</p>
            </header>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Nombre</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-ink">{user?.name}</dd>
              </div>
              <div className="rounded-xl border border-line px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-ink">{user?.email}</dd>
              </div>
              <div className="rounded-xl border border-line px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Alta</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {formatDate(user?.created_at) || '—'}
                </dd>
              </div>
              <div className="rounded-xl border border-line px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Identificador</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">#{user?.id}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                leftIcon={<FiUser />}
                rightIcon={<FiArrowRight />}
                onClick={() => navigate(VIEWS.PROFILE)}
              >
                Ir a mi perfil
              </Button>
              <Button variant="outline" leftIcon={<FiLink />} onClick={() => navigate(VIEWS.PROFILE)}>
                Gestionar cuentas
              </Button>
            </div>
          </Card>
        </div>

        <div className="col-12 col-lg-5">
          <Card className="h-full">
            <header className="mb-4 flex flex-col gap-1">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-lg text-ink"
              >
                <FiShield />
              </span>
              <h2 className="mt-1 text-lg font-semibold text-ink">Sistema B · useState</h2>
              <p className="text-sm text-muted">
                La misma aplicación, la misma API, pero la navegación es una única variable de
                estado.
              </p>
            </header>

            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li className="flex items-center gap-2.5">
                <code className="rounded-lg bg-surface-alt px-2 py-0.5 text-xs text-ink">
                  useState('login')
                </code>
                <span>vista activa</span>
              </li>
              <li className="flex items-center gap-2.5">
                <code className="rounded-lg bg-surface-alt px-2 py-0.5 text-xs text-ink">
                  navigate(vista)
                </code>
                <span>reemplaza al router</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span>La URL no cambia al navegar.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
