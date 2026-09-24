// ============================================================
// Components/SkillsSection.jsx  (Sección)
// Muestra la grilla de habilidades obtenidas desde /api/skills.
// Grid responsivo: 1 columna (sm:2, lg:3, xl:4).
// ============================================================
import useApiData from '../Scripts/useApiData.js';
import { SkillCard } from './SkillCard.jsx';

export function SkillsSection() {
  const { data: skills, loading, error } = useApiData('/api/skills');

  return (
    <section
      id="skills"
      className="w-full py-16 md:py-24 px-6 md:px-10 lg:px-16
        bg-cream/40 dark:bg-deepBrown/40"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title font-display text-3xl md:text-4xl lg:text-5xl
          font-bold text-softBrown dark:text-mustard mb-10 md:mb-14">
          Habilidades
        </h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-softBrown/5 dark:bg-mutedBeige/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-softBrown/70 dark:text-mutedBeige">
            <p className="font-semibold">No se pudieron cargar las habilidades.</p>
            <p className="text-sm mt-1">Inténtalo nuevamente más tarde.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {(skills || []).map((skill) => (
              <SkillCard
                key={skill.id}
                {...skill}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SkillsSection;
