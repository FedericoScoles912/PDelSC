// ============================================================
// Components/ExperienceItem.jsx  (Molécula)
// Bloque de experiencia laboral: rol, empresa, fechas,
// ubicación y descripción. Se usa dentro de TimelineItem.
// ============================================================
import { Badge } from './Badge.jsx';
import { Icon } from './Icon.jsx';
import { formatDate } from '../Scripts/utils.js';

/**
 * @param {Object} props
 * @param {Number} props.id
 * @param {String} props.company
 * @param {String} props.role
 * @param {String|Date} props.start_date
 * @param {String|Date|null} [props.end_date]  null = actualmente
 * @param {String} [props.location]
 * @param {String} [props.description]
 */
export function ExperienceItem({
  id,
  company,
  role,
  start_date,
  end_date = null,
  location,
  description,
}) {
  const startFmt = formatDate(start_date);
  const endFmt = end_date ? formatDate(end_date) : 'Actualidad';

  return (
    <article
      key={id}
      className="w-full rounded-2xl p-5 md:p-6
        bg-white/70 dark:bg-deepBrown/50
        border border-terracotta/15 dark:border-burntOrange/15
        shadow-warm dark:shadow-warmDark"
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-softBrown dark:text-mustard">
            {role || '[Tu Rol]'}
          </h3>
          <p className="font-semibold text-terracotta dark:text-burntOrange">
            {company || '[Empresa]'}
          </p>
        </div>
        <div className="text-right text-xs md:text-sm text-softBrown/70 dark:text-mutedBeige/90 tabular-nums">
          <div>
            {startFmt} — {endFmt}
          </div>
          {location && (
            <Badge className="mt-2" color="softBrown">
              <Icon name="location" size={12} />
              {location}
            </Badge>
          )}
        </div>
      </header>

      <p className="mt-4 text-sm md:text-base leading-relaxed text-softBrown/85 dark:text-mutedBeige whitespace-pre-line">
        {description || '[Descripción de logros y responsabilidades en el puesto]'}
      </p>
    </article>
  );
}

export default ExperienceItem;
