import { classNames } from '../../Scripts/utils/helpers.js';
import Button from '../atoms/Button.jsx';

/**
 * Paleta inline SVG por proveedor OAuth — sin assets externos.
 */
const BRANDS = {
  google: {
    label: 'Continuar con Google',
    bg: '#ffffff',
    color: '#333',
    border: '#dadce0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11.5 0 20-9.3 20-20.8 0-1.4-.2-2.7-.4-4z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.3-5.3c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.1 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C40.7 36.2 44 30.9 44 24c0-1.4-.2-2.7-.4-3.5z"/>
      </svg>
    ),
  },
  meta: {
    label: 'Continuar con Meta / Facebook',
    bg: '#1877F2',
    color: '#fff',
    border: 'transparent',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12z"/>
      </svg>
    ),
  },
  github: {
    label: 'Continuar con GitHub',
    bg: '#24292e',
    color: '#fff',
    border: 'transparent',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2z"/>
      </svg>
    ),
  },
  twitter: {
    label: 'Continuar con X',
    bg: '#000',
    color: '#fff',
    border: 'transparent',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  discord: {
    label: 'Continuar con Discord',
    bg: '#5865F2',
    color: '#fff',
    border: 'transparent',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M20.3 4.4A17.7 17.7 0 0 0 16 3l-.1.2a14.3 14.3 0 0 0-7.8 0L8 3a17.7 17.7 0 0 0-4.3 1.4A18.5 18.5 0 0 0 .2 15a18.2 18.2 0 0 0 5.5 2.7l.4-.5c-1-.3-2-.8-2.9-1.4l.2-.2a13.3 13.3 0 0 0 16.8 0l.2.2c-.9.6-1.9 1.1-2.9 1.4l.4.5a18.2 18.2 0 0 0 5.5-2.7 18.5 18.5 0 0 0-3.1-10.6zM8.5 12.9c-1 0-1.8-.9-1.8-2s.8-2 1.8-2c1 0 1.8.9 1.8 2s-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/>
      </svg>
    ),
  },
  twitch: {
    label: 'Continuar con Twitch',
    bg: '#9146FF',
    color: '#fff',
    border: 'transparent',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M4 3L2.5 7.5v13.5H7V24h3.5L14 21h4l6-6V3zm16 10.5l-3.5 3.5h-5l-3 3V17H6.5V5h13.5z"/>
        <path d="M17.5 7h-1.5v5.5h1.5zm-4.5 0H11.5v5.5H13z"/>
      </svg>
    ),
  },
};

/**
 * Molécula: SocialLoginButton
 * @param {'google'|'meta'|'github'|'twitter'|'discord'|'twitch'} provider
 */
export default function SocialLoginButton({
  provider,
  onClick,
  disabled,
  label,
  className,
  fullWidth = true,
}) {
  const brand = BRANDS[provider];
  if (!brand) return null;

  return (
    <Button
      variant="secondary"
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      className={classNames('!gap-3 !justify-start !h-11', className)}
      style={{
        background: brand.bg,
        color: brand.color,
        borderColor: brand.border,
      }}
      aria-label={brand.label}
    >
      <span className="shrink-0">{brand.icon}</span>
      <span className="text-sm">{label || brand.label}</span>
    </Button>
  );
}

export const OAUTH_PROVIDERS = Object.keys(BRANDS);
