// ============================================================
// Components/SkillsSection.jsx  (Sección)
// Muestra la grilla de habilidades obtenidas desde /api/skills.
// Grid responsivo: 1 columna (sm:2, lg:3, xl:4).
// ============================================================
import Icon from './Icon.jsx';
import useApiData from '../Scripts/useApiData.js';

function SkillsEmpty() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown/70 dark:text-mutedBeige
                    bg-cream/50 dark:bg-deepBrown/50
                    rounded-2xl border border-dashed border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="code" size={40} />
      <p className="text-lg font-semibold">Aún no hay habilidades registradas</p>
      <p className="text-sm">Agrega tecnologías desde el panel de administración.</p>
    </div>
  );
}

function SkillsError({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown dark:text-mustard
                    bg-terracotta/10 dark:bg-burntOrange/10
                    rounded-2xl border border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="error" size={40} />
      <p className="text-lg font-semibold">Error al cargar las habilidades</p>
      <p className="text-sm text-softBrown/70 dark:text-mutedBeige">
        {message || 'Verificá que el servidor y la base de datos MySQL estén en ejecución.'}
      </p>
    </div>
  );
}

function SkillsLoading({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-6 bg-cream/50 dark:bg-deepBrown/50
                                 border border-terracotta/20 dark:border-burntOrange/20
                                 animate-pulse" aria-hidden="true">
          <div className="h-6 w-1/3 bg-terracotta/15 dark:bg-burntOrange/15 rounded mb-4" />
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-20 bg-terracotta/10 dark:bg-burntOrange/10 rounded-lg" />
            <div className="h-8 w-24 bg-terracotta/10 dark:bg-burntOrange/10 rounded-lg" />
            <div className="h-8 w-16 bg-terracotta/10 dark:bg-burntOrange/10 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}

export function SkillsSection() {
  const { data, loading, error } = useApiData('/api/skills');
  const groups = (data || []).reduce((result, skill) => {
    (result[skill.category] ||= []).push(skill.name);
    return result;
  }, {});
  const hasData = Object.keys(groups).length > 0;
  return (
    <section
      id="skills"
      className="w-full py-20 px-6 md:px-10 lg:px-16 bg-cream/40 dark:bg-deepBrown/40"
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta dark:text-burntOrange mb-3">Tecnologías</p>
        <h2 className="section-title text-3xl md:text-4xl font-bold tracking-tight text-softBrown dark:text-mustard mb-10">
          Habilidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading && <SkillsLoading />}
          {!loading && error && <SkillsError message={error} />}
          {!loading && !error && !hasData && <SkillsEmpty />}
          {!loading && !error && hasData && Object.entries(groups).map(([category, skills]) => (
            <article key={category} className="rounded-2xl border border-terracotta/20 dark:border-burntOrange/25 bg-cream dark:bg-deepBrown p-6 shadow-warm dark:shadow-warmDark transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <h3 className="font-display font-semibold text-softBrown dark:text-mustard">{category}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((name) => <span key={name} className="rounded-lg bg-mustard/15 dark:bg-burntOrange/20 px-3 py-1.5 text-sm font-medium text-softBrown dark:text-mutedBeige">{name}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SkillsSection;
