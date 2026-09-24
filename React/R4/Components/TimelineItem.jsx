// ============================================================
// Components/TimelineItem.jsx  (Molécula)
// Item de línea de tiempo: línea vertical + punto + children.
// En desktop alterna lados, en mobile todo a la izquierda.
// ============================================================
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children  (ExperienceItem normalmente)
 * @param {Number} props.index   0..n para alternar lados en desktop
 */
export function TimelineItem({ children, index = 0 }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 py-4 md:py-6"
    >
      {/* Línea vertical central (solo md+) */}
      <span
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5
          bg-gradient-to-b from-terracotta via-olive to-mustard
          dark:from-burntOrange dark:via-mustard dark:to-mutedBeige"
        aria-hidden="true"
      />
      {/* Línea vertical a la izquierda (mobile) */}
      <span
        className="md:hidden absolute left-2.5 top-0 bottom-0 w-0.5
          bg-gradient-to-b from-terracotta via-olive to-mustard
          dark:from-burntOrange dark:via-mustard dark:to-mutedBeige"
        aria-hidden="true"
      />

      {/* Punto (desktop: central; mobile: a la izquierda) */}
      <span
        className="absolute top-8 md:left-1/2 md:-translate-x-1/2 left-2.5 -translate-x-1/2
          w-5 h-5 rounded-full bg-cream dark:bg-deepBrown
          border-4 border-terracotta dark:border-burntOrange z-10"
        aria-hidden="true"
      />

      {/* Columna izquierda (desktop) */}
      <div className={`pl-10 md:pl-0 ${isLeft ? 'md:pr-12 md:text-right' : 'md:order-1'}`}>
        {isLeft ? <div className="md:max-w-lg md:ml-auto">{children}</div> : null}
      </div>

      {/* Columna derecha (desktop) */}
      <div className={`pl-10 md:pl-0 ${!isLeft ? 'md:pl-12' : ''}`}>
        {!isLeft ? <div className="md:max-w-lg">{children}</div> : null}
      </div>
    </motion.div>
  );
}

export default TimelineItem;
