// ============================================================
// Components/AchievementsSection.jsx
// Sección "Logros & Certificaciones". Consume datos desde la
// API REST /api/achievements mediante el hook useApiData.
// Muestra tarjetas en grid responsive (1 / md:2 / lg:3 cols).
// Cada tarjeta puede incluir un enlace al certificado (ghost).
// ============================================================
import { motion } from 'framer-motion';
import useApiData from '../Scripts/useApiData.js';
import { formatDate } from '../Scripts/utils.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

/**
 * Esquema esperado de cada logro (no tipado, solo referencia):
 * {
 *   id: number,
 *   title: string,
 *   issuer: string,          (organismo que otorga el logro)
 *   date: string | Date,     (fecha de emisión)
 *   description: string,     (descripción breve)
 *   certificate_url?: string (URL al certificado, opcional)
 * }
 */

/**
 * Variantes para la animación del grid (stagger suave).
 */
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * Renderiza el estado de carga: tarjetas placeholder (skeleton).
 * @param {Number} count Cantidad de skeletons a mostrar
 */
function LoadingSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-6 bg-cream/50 dark:bg-deepBrown/50
                     border border-terracotta/20 dark:border-burntOrange/20
                     animate-pulse"
          aria-hidden="true"
        >
          <div className="w-12 h-12 rounded-xl bg-terracotta/20 dark:bg-burntOrange/20 mb-4" />
          <div className="h-6 w-3/4 bg-terracotta/15 dark:bg-burntOrange/15 rounded mb-2" />
          <div className="h-4 w-1/2 bg-terracotta/10 dark:bg-burntOrange/10 rounded mb-4" />
          <div className="h-4 w-full bg-terracotta/10 dark:bg-burntOrange/10 rounded mb-2" />
          <div className="h-4 w-5/6 bg-terracotta/10 dark:bg-burntOrange/10 rounded" />
        </div>
      ))}
    </>
  );
}

/**
 * Renderiza un mensaje de error con estilo coherente.
 * @param {String} message Descripción del error
 */
function ErrorMessage({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown dark:text-mustard
                    bg-terracotta/10 dark:bg-burntOrange/10
                    rounded-2xl border border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="error" size={40} />
      <p className="text-lg font-semibold">Error al cargar los logros</p>
      <p className="text-sm text-softBrown/70 dark:text-mutedBeige">
        {message || 'Por favor, inténtalo nuevamente más tarde.'}
      </p>
    </div>
  );
}

/**
 * Renderiza un mensaje cuando no hay datos para mostrar.
 */
function EmptyMessage() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown/70 dark:text-mutedBeige
                    bg-cream/50 dark:bg-deepBrown/50
                    rounded-2xl border border-dashed border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="award" size={40} />
      <p className="text-lg font-semibold">Aún no hay logros registrados</p>
      <p className="text-sm">Agrega certificaciones y logros para que aparezcan aquí.</p>
    </div>
  );
}

/**
 * Tarjeta individual de logro / certificación.
 * @param {Object} props
 * @param {Object} props.item Datos del logro
 * @param {Number} props.index Índice para la key
 */
function AchievementCard({ item }) {
  const {
    title = '[Título del logro]',
    issuer = '[Entidad emisora]',
    date = null,
    description = '[Descripción breve del logro o certificación]',
    certificate_url = null,
  } = item || {};

  // Formateamos la fecha solo si existe; si falla, mostramos placeholder
  const formattedDate = date ? formatDate(date) : '[Fecha]';

  return (
    <motion.article
      variants={cardVariants}
      className="flex flex-col h-full p-6 rounded-2xl
                 bg-cream dark:bg-deepBrown
                 border border-terracotta/20 dark:border-burntOrange/25
                 shadow-warm dark:shadow-warmDark
                 hover:-translate-y-1 hover:shadow-lg
                 transition-all duration-300"
    >
      {/* Ícono de premio (arriba) */}
      <div className="flex items-center justify-center w-12 h-12 mb-4
                      rounded-xl bg-mustard/20 dark:bg-burntOrange/20
                      text-terracotta dark:text-mustard
                      flex-shrink-0">
        <Icon name="award" size={26} />
      </div>

      {/* Título */}
      <h3 className="text-xl font-display font-bold mb-2
                     text-softBrown dark:text-mustard">
        {title}
      </h3>

      {/* Emisor + Fecha */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4
                      text-sm font-medium
                      text-softBrown/80 dark:text-mutedBeige">
        <span className="inline-flex items-center gap-1">
          <Icon name="briefcase" size={14} />
          {issuer}
        </span>
        <span className="text-terracotta dark:text-burntOrange font-semibold">
          • {formattedDate}
        </span>
      </div>

      {/* Descripción */}
      <p className="text-sm md:text-base leading-relaxed mb-6 flex-grow
                    text-softBrown/90 dark:text-mutedBeige">
        {description}
      </p>

      {/* Botón "Ver certificado" (solo si existe URL) */}
      {certificate_url && (
        <a
          href={certificate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto"
        >
          <Button variant="ghost" size="sm" className="w-full justify-center">
            <Icon name="external-link" size={16} />
            Ver certificado
          </Button>
        </a>
      )}
    </motion.article>
  );
}

/**
 * AchievementsSection: sección principal.
 * - Usa useApiData('/api/achievements') para obtener la data
 * - Muestra loading / error / empty / grid según el estado
 */
export default function AchievementsSection() {
  // Llamada a la API (endpoint /api/achievements)
  const { data, loading, error } = useApiData('/api/achievements');

  // Normalizamos data: si es array lo usamos, si no, array vacío
  const achievements = Array.isArray(data) ? data : [];

  return (
    <motion.section
      id="achievements"
      className="section-container"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-10">
        {/* Título de sección */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Logros &amp; Certificaciones</h2>
        </motion.div>

        {/* Grid responsive: 1 col móvil, 2 md, 3 lg+ */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Estado: cargando */}
          {loading && <LoadingSkeleton count={6} />}

          {/* Estado: error */}
          {!loading && error && <ErrorMessage message={error} />}

          {/* Estado: vacío */}
          {!loading && !error && achievements.length === 0 && <EmptyMessage />}

          {/* Estado: éxito -> renderizamos tarjetas */}
          {!loading && !error && achievements.length > 0 &&
            achievements.map((item, idx) => (
              <AchievementCard
                key={item?.id || `achievement-${idx}`}
                item={item}
              />
            ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
