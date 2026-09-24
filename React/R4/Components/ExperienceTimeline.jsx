// ============================================================
// Components/ExperienceTimeline.jsx  (Sección)
// Línea de tiempo con la experiencia laboral cargada desde
// /api/experiences. Cada item envuelve ExperienceItem en un
// TimelineItem que alterna lados según el índice.
// ============================================================
import useApiData from '../Scripts/useApiData.js';
import { TimelineItem } from './TimelineItem.jsx';
import { ExperienceItem } from './ExperienceItem.jsx';

export function ExperienceTimeline() {
  const { data: experiences, loading, error } = useApiData('/api/experiences');

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

        {loading && (
          <div className="flex flex-col gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-softBrown/5 dark:bg-mutedBeige/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-softBrown/70 dark:text-mutedBeige">
            <p className="font-semibold">No se pudo cargar la experiencia laboral.</p>
            <p className="text-sm mt-1">Inténtalo nuevamente más tarde.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col">
            {(experiences || []).map((exp, i) => (
              <TimelineItem key={exp.id || i} index={i}>
                <ExperienceItem {...exp} />
              </TimelineItem>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ExperienceTimeline;
