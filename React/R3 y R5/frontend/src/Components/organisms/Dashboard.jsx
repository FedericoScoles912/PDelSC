import { useEffect, useState } from 'react';
import useAuth from '../../Scripts/hooks/useAuth.js';
import authService from '../../Scripts/services/authService.js';
import Icon from '../atoms/Icon.jsx';
import { formatDate } from '../../Scripts/utils/helpers.js';

/**
 * Organismo: Dashboard — vista principal tras login.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [linked, setLinked] = useState([]);
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.getMe();
        if (!cancelled && res?.ok) {
          setLinked(res.linkedAccounts || []);
          setCreatedAt(res.user.createdAt);
        }
      } catch (_e) { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { label: 'Sesión activa', value: user?.email || '—', icon: 'mail', accent: 'var(--accent-primary)' },
    { label: 'Nombre visible',  value: user?.displayName || '—', icon: 'user', accent: 'var(--accent-secondary)' },
    { label: 'Cuentas enlazadas', value: String(linked.length), icon: 'check', accent: 'var(--accent-tertiary)' },
    { label: 'Registro', value: createdAt ? formatDate(createdAt) : '—', icon: 'info', accent: 'var(--accent-success)' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-bold text-balance mb-2">
          Hola, <span style={{ color: 'var(--accent-primary)' }}>{user?.displayName || 'Usuario'}</span> 🍂
        </h1>
        <p className="text-lg max-w-2xl mb-0">
          Estás en el <strong>Dashboard</strong>. Esta misma pantalla se renderiza
          tanto con <em>React Router</em> como con <em>useState</em> — el control de acceso
          es equivalente en ambos sistemas.
        </p>
      </section>

      <section className="card p-6">
        <h3 className="text-xl font-semibold mb-4">Resumen de la cuenta</h3>
        <div className="row g-4">
          {stats.map((s) => (
            <div key={s.label} className="col-12 col-sm-6 col-lg-3">
              <div className="h-full p-4 rounded-lg bg-[color:var(--bg-secondary)] border border-[color:var(--border-subtle)]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white"
                    style={{ background: s.accent }}
                  >
                    <Icon name={s.icon} size={18} />
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wide text-[color:var(--text-muted)] mb-1">{s.label}</p>
                <p className="font-semibold text-[color:var(--text-primary)] break-all mb-0">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-xl font-semibold mb-0">Proveedores OAuth enlazados</h3>
          <span className="chip">{linked.length} cuenta{linked.length === 1 ? '' : 's'}</span>
        </div>
        {linked.length === 0 ? (
          <p className="text-[color:var(--text-secondary)] mb-0">
            No hay cuentas sociales enlazadas. Podés iniciar sesión con cualquier proveedor para asociarlo a tu mismo email.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {linked.map((a) => (
              <div
                key={a.provider}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-secondary)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md text-white capitalize text-xs font-bold"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    {a.provider.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold capitalize mb-0">{a.provider}</p>
                    <small className="text-[color:var(--text-muted)]">
                      {formatDate(a.createdAt)}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
