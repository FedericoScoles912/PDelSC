// ============================================================
// Components/ExperienceTimeline.jsx  (Sección)
// Línea de tiempo de experiencia laboral. Cada item envuelve
// ExperienceItem en un TimelineItem que alterna lados según el índice.
// ============================================================
import { TimelineItem } from './TimelineItem.jsx';
import { ExperienceItem } from './ExperienceItem.jsx';
import useApiData from '../Scripts/useApiData.js';
import Icon from './Icon.jsx';

function ExperienceEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown/70 dark:text-mutedBeige
                    bg-cream/50 dark:bg-deepBrown/50
                    rounded-2xl border border-dashed border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="briefcase" size={40} />
      <p className="text-lg font-semibold">Aún no hay experiencia registrada</p>
      <p className="text-sm">Agrega tu trayectoria desde el panel de administración.</p>
    </div>
  );
}

function ExperienceError({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown dark:text-mustard
                    bg-terracotta/10 dark:bg-burntOrange/10
                    rounded-2xl border border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="error" size={40} />
      <p className="text-lg font-semibold">Error al cargar la experiencia</p>
      <p className="text-sm text-softBrown/70 dark:text-mutedBeige">
        {message || 'Verificá que el servidor y la base de datos MySQL estén en ejecución.'}
      </p>
    </div>
  );
}

function ExperienceLoading({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-6 mb-6 bg-cream/50 dark:bg-deepBrown/50
                                 border border-terracotta/20 dark:border-burntOrange/20
                                 animate-pulse" aria-hidden="true">
          <div className="h-6 w-1/3 bg-terracotta/15 dark:bg-burntOrange/15 rounded mb-3" />
          <div className="h-5 w-1/4 bg-terracotta/10 dark:bg-burntOrange/10 rounded mb-4" />
          <div className="h-4 w-full bg-terracotta/10 dark:bg-burntOrange/10 rounded mb-2" />
          <div className="h-4 w-5/6 bg-terracotta/10 dark:bg-burntOrange/10 rounded" />
        </div>
      ))}
    </>
  );
}

export function ExperienceTimeline() {
  const { data: experiences, loading, error } = useApiData('/api/experiences');
  const list = experiences || [];
  return (
    <section
      id="experience"
      className="w-full py-16 md:py-24 px-6 md:px-10 lg:px-16"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title font-display text-3xl md:text-4xl lg:text-5xl
          font-bold text-softBrown dark:text-mustard mb-10 md:mb-14">
          Experiencia laboral
        </h2>

        <div className="flex flex-col">
          {loading && <ExperienceLoading />}
          {!loading && error && <ExperienceError message={error} />}
          {!loading && !error && list.length === 0 && <ExperienceEmpty />}
          {!loading && !error && list.map((exp, i) => (
            <TimelineItem key={exp.id} index={i}>
              <ExperienceItem {...exp} />
            </TimelineItem>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExperienceTimeline;
