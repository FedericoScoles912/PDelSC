// ============================================================
// Components/Badge.jsx  (Átomo)
// Chip pequeño para etiquetas: categoría, tags, estados
// ============================================================
/**
 * @param {Object} props
 * @param {'default'|'terracotta'|'olive'|'mustard'|'softBrown'} [props.color='default']
 * @param {String} [props.className]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} props.children
 */
export function Badge({ color = 'default', className = '', icon, children }) {
  // Paleta por variante
  const colors = {
    default:
      'bg-terracotta/15 text-softBrown dark:bg-burntOrange/20 dark:text-mustard',
    terracotta:
      'bg-terracotta text-cream',
    olive:
      'bg-olive text-cream',
    mustard:
      'bg-mustard text-deepBrown',
    softBrown:
      'bg-softBrown text-cream dark:bg-mutedBeige dark:text-deepBrown',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs md:text-sm font-medium ${
        colors[color] || colors.default
      } ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
