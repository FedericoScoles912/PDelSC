import { useState } from 'react';
import { FiArrowRight, FiLogOut, FiMail, FiUser } from 'react-icons/fi';

import Button from '../Components/Button.jsx';
import Card from '../Components/Card.jsx';
import Divider from '../Components/Divider.jsx';
import Input from '../Components/Input.jsx';
import Modal from '../Components/Modal.jsx';
import ProviderBadge from '../Components/ProviderBadge.jsx';
import SocialButtonGroup from '../Components/SocialButtonGroup.jsx';
import Spinner from '../Components/Spinner.jsx';
import ThemeToggle from '../Components/ThemeToggle.jsx';
import { OAUTH_PROVIDER_IDS } from '../Scripts/config/oauthProviders.js';
import { useNotice } from '../Scripts/hooks/useNotice.js';

/** Bloque de sección con título, usado solo en esta vista de verificación. */
function Section({ title, description, children }) {
  return (
    <Card className="h-full">
      <header className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </header>
      {children}
    </Card>
  );
}

/**
 * Vista de verificación del sistema de diseño compartido (Etapa 3).
 *
 * Permite comprobar visualmente, en claro y oscuro, todos los componentes
 * atómicos, el Context y los hooks antes de construir los dos sistemas.
 * Se conserva como referencia del sistema de diseño.
 */
export default function DesignSystem() {
  const { notify, confirm } = useNotice();
  const [modalOpen, setModalOpen] = useState(false);
  const [busyProvider, setBusyProvider] = useState(null);
  const [linked, setLinked] = useState(['google', 'github']);

  const toggleLink = (provider) => {
    setLinked((current) =>
      current.includes(provider) ? current.filter((id) => id !== provider) : [...current, provider]
    );
  };

  const demoRedirect = (provider) => {
    setBusyProvider(provider);
    window.setTimeout(() => setBusyProvider(null), 1400);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="container-fluid mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              user-auth-system
            </p>
            <h1 className="text-xl font-semibold text-ink">Sistema de diseño compartido</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">Modo claro / oscuro</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container-fluid mx-auto max-w-[1600px] px-6 py-8">
        <div className="row g-4">
          {/* --- Botones --- */}
          <div className="col-12 col-xl-6">
            <Section title="Botones" description="6 variantes y 3 tamaños, con estado de carga.">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primario</Button>
                <Button variant="accent">Mostaza</Button>
                <Button variant="olive">Oliva</Button>
                <Button variant="danger">Peligro</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button size="sm">Pequeño</Button>
                <Button size="md">Medio</Button>
                <Button size="lg">Grande</Button>
                <Button loading>Guardando…</Button>
                <Button disabled>Deshabilitado</Button>
              </div>
              <div className="mt-4">
                <Button fullWidth rightIcon={<FiArrowRight />}>
                  Ancho completo con ícono
                </Button>
              </div>
            </Section>
          </div>

          {/* --- Campos --- */}
          <div className="col-12 col-xl-6">
            <Section title="Campos" description="Con ícono, ayuda, error y toggle de contraseña.">
              <div className="flex flex-col gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ada Lovelace"
                  leadingIcon={<FiUser />}
                  defaultValue="Ada Lovelace"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="ada@ejemplo.com"
                  leadingIcon={<FiMail />}
                  hint="Usamos este email para notificaciones."
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  defaultValue="otoño2026"
                />
                <Input
                  label="Email"
                  type="email"
                  defaultValue="correo-invalido"
                  error="Ingresá un email válido."
                />
              </div>
            </Section>
          </div>

          {/* --- Botones sociales --- */}
          <div className="col-12 col-xl-6">
            <Section
              title="Botones sociales"
              description="Grilla responsive de Bootstrap: 4 columnas en desktop, 2 en tablet, 1 en mobile."
            >
              <SocialButtonGroup busyProvider={busyProvider} onSelect={demoRedirect} columns={4} />
              <Divider label="o continuá con email" className="my-6" />
              <SocialButtonGroup
                providers={['google', 'github']}
                onSelect={demoRedirect}
                columns={2}
                size="lg"
              />
            </Section>
          </div>

          {/* --- Cuentas vinculadas --- */}
          <div className="col-12 col-xl-6">
            <Section
              title="Cuentas vinculadas"
              description="Badges de proveedores con acción de vincular/desvincular."
            >
              <div className="flex flex-col gap-3">
                {OAUTH_PROVIDER_IDS.slice(0, 4).map((provider) => (
                  <ProviderBadge
                    key={provider}
                    provider={provider}
                    linked={linked.includes(provider)}
                    onLink={toggleLink}
                    onUnlink={toggleLink}
                  />
                ))}
              </div>
            </Section>
          </div>

          {/* --- Avisos y modales --- */}
          <div className="col-12 col-xl-6">
            <Section
              title="Avisos y modales"
              description="Reemplazo propio de alert() y confirm(). Único en ambos sistemas."
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="olive"
                  onClick={() => notify({ type: 'success', message: 'Perfil actualizado.' })}
                >
                  Notificar éxito
                </Button>
                <Button
                  variant="accent"
                  onClick={() => notify({ type: 'warning', message: 'Tu sesión expira pronto.' })}
                >
                  Notificar aviso
                </Button>
                <Button
                  variant="danger"
                  onClick={() => notify({ type: 'error', message: 'No pudimos completar la acción.' })}
                >
                  Notificar error
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Desvincular cuenta',
                      message: '¿Seguro que querés desvincular esta cuenta social?',
                      confirmText: 'Desvincular',
                      destructive: true,
                    });
                    notify({
                      type: ok ? 'info' : 'success',
                      message: ok ? 'Confirmaste la acción.' : 'Cancelaste la acción.',
                    });
                  }}
                >
                  Confirmar acción
                </Button>
                <Button variant="ghost" onClick={() => setModalOpen(true)}>
                  Abrir modal
                </Button>
              </div>
            </Section>
          </div>

          {/* --- Tarjetas y carga --- */}
          <div className="col-12 col-xl-6">
            <Section title="Tarjetas y carga" description="Variantes de Card e indicadores de progreso.">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <Card variant="solid" padded className="h-full">
                    <p className="text-sm font-medium text-ink">Sólida</p>
                    <p className="text-xs text-muted">Superficie elevada.</p>
                  </Card>
                </div>
                <div className="col-12 col-sm-6">
                  <Card variant="muted" padded className="h-full">
                    <p className="text-sm font-medium text-ink">Atenuada</p>
                    <p className="text-xs text-muted">Superficie secundaria.</p>
                  </Card>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <span className="text-sm text-muted">Spinners sm / md / lg</span>
              </div>
            </Section>
          </div>
        </div>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal propio"
        description="Accesible, con cierre por Escape y bloqueo del scroll."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              leftIcon={<FiLogOut />}
              onClick={() => {
                setModalOpen(false);
                notify({ type: 'info', message: 'Acción confirmada desde el modal.' });
              }}
            >
              Aceptar
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink">
          Este modal es la base del sistema de avisos. Ninguna parte de la aplicación usa
          <code className="mx-1 rounded bg-surface-alt px-1.5 py-0.5 text-xs">alert()</code>,
          <code className="mx-1 rounded bg-surface-alt px-1.5 py-0.5 text-xs">confirm()</code> ni
          <code className="mx-1 rounded bg-surface-alt px-1.5 py-0.5 text-xs">prompt()</code>.
        </p>
      </Modal>
    </div>
  );
}
