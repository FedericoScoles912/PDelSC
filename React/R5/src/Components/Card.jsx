import { cn } from '../Scripts/utils/helpers.js';

/**
 * Contenedor tipo tarjeta. Base visual de formularios, paneles y modales.
 *
 * - variant: solid (fondo surface) | muted (surface-alt) | outline (borde fino)
 */
const VARIANTS = {
  solid: 'bg-surface border border-line shadow-card',
  muted: 'bg-surface-alt border border-line/70',
  outline: 'bg-transparent border border-line',
};

export default function Card({
  children,
  variant = 'solid',
  padded = true,
  as: Tag = 'div',
  className,
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'rounded-2xl',
        VARIANTS[variant] ?? VARIANTS.solid,
        padded && 'p-6 sm:p-8',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
