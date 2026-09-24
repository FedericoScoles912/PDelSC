// ============================================================
// Components/Avatar.jsx  (Átomo)
// Imagen circular con borde, tamaño variable y fallback de
// iniciales en caso de error o src vacío.
// ============================================================
import { useState } from 'react';

/**
 * @param {Object} props
 * @param {String} [props.src]
 * @param {String} [props.alt='Avatar']
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='lg']
 * @param {String} [props.name] Nombre para extraer iniciales fallback
 * @param {String} [props.className]
 */
export function Avatar({
  src,
  alt = 'Avatar',
  size = 'lg',
  name = '[Tu nombre]',
  className = '',
}) {
  const [error, setError] = useState(false);

  // Tamaños del avatar en píxeles
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-28 h-28 md:w-36 md:h-36 text-3xl md:text-4xl',
    xl: 'w-40 h-40 md:w-52 md:h-52 text-4xl md:text-6xl',
  };

  // Extrae iniciales (2 letras máx.)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const showImage = src && !error;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full
        border-4 border-terracotta/60 dark:border-burntOrange/70
        shadow-warm dark:shadow-warmDark overflow-hidden bg-cream dark:bg-deepBrown
        ${sizes[size] || sizes.lg} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className="font-display font-bold select-none
            text-softBrown dark:text-mustard"
        >
          {initials || '?'}
        </span>
      )}
    </div>
  );
}

export default Avatar;
