// ============================================================
// Components/SkillCard.jsx  (Molécula)
// Tarjeta de habilidad: ícono, nombre, categoría y barra
// animada de nivel. Usa Framer Motion para animar la barra.
// ============================================================
import { motion } from 'framer-motion';
import { Badge } from './Badge.jsx';
import { Icon } from './Icon.jsx';

/**
 * @param {Object} props
 * @param {Number} props.id
 * @param {String} props.name
 * @param {Number} props.level 0..100
 * @param {String} [props.category]
 * @param {String} [props.icon_name='code']  key de Components/Icon.jsx
 */
export function SkillCard({
  id,
  name,
  level,
  category = 'General',
  icon_name = 'code',
}) {
  const safeLevel = Math.min(100, Math.max(0, Number(level) || 0));

  return (
    <motion.article
      key={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative rounded-2xl p-5
        bg-white/60 dark:bg-deepBrown/40
        border border-terracotta/15 dark:border-burntOrange/15
        shadow-warm dark:shadow-warmDark
        hover:shadow-lg hover:-translate-y-0.5
        transition-transform duration-300"
    >
      {/* Encabezado: ícono + nombre + badge categoría */}
      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex-shrink-0 w-10 h-10 rounded-xl
              bg-terracotta/15 dark:bg-burntOrange/20
              text-terracotta dark:text-mustard
              flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon name={icon_name} size={22} />
          </span>
          <h3 className="font-semibold truncate text-softBrown dark:text-mustard">
            {name}
          </h3>
        </div>
        <Badge>{category}</Badge>
      </header>

      {/* Barra de progreso animada */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow h-2.5 rounded-full overflow-hidden bg-softBrown/10 dark:bg-mutedBeige/15">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full
              bg-gradient-to-r from-terracotta to-olive
              dark:from-burntOrange dark:to-mustard"
            initial={{ width: 0 }}
            whileInView={{ width: `${safeLevel}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            title={`Nivel ${safeLevel}%`}
          />
        </div>
        <span className="text-xs md:text-sm font-semibold text-softBrown/80 dark:text-mutedBeige/90 tabular-nums min-w-[3ch] text-right">
          {safeLevel}%
        </span>
      </div>
    </motion.article>
  );
}

export default SkillCard;
