// ============================================================
// Components/ProjectsGallery.jsx  (Sección)
// Galería de proyectos con flujo automático. Los proyectos
// destacados (featured=true) ocupan md:col-span-2.
// Datos de proyectos del portfolio.
// ============================================================
import { ProjectCard } from './ProjectCard.jsx';
import useApiData from '../Scripts/useApiData.js';
import Icon from './Icon.jsx';

function ProjectsEmpty() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown/70 dark:text-mutedBeige
                    bg-cream/50 dark:bg-deepBrown/50
                    rounded-2xl border border-dashed border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="external-link" size={40} />
      <p className="text-lg font-semibold">Aún no hay proyectos registrados</p>
      <p className="text-sm">Agrega tus trabajos desde el panel de administración.</p>
    </div>
  );
}

function ProjectsError({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16
                    text-softBrown dark:text-mustard
                    bg-terracotta/10 dark:bg-burntOrange/10
                    rounded-2xl border border-terracotta/30 dark:border-burntOrange/30">
      <Icon name="error" size={40} />
      <p className="text-lg font-semibold">Error al cargar los proyectos</p>
      <p className="text-sm text-softBrown/70 dark:text-mutedBeige">
        {message || 'Verificá que el servidor y la base de datos MySQL estén en ejecución.'}
      </p>
    </div>
  );
}

function ProjectsLoading({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-cream/50 dark:bg-deepBrown/50
                                 border border-terracotta/20 dark:border-burntOrange/20
                                 animate-pulse" aria-hidden="true">
          <div className="aspect-video bg-terracotta/10 dark:bg-burntOrange/10" />
          <div className="p-5 space-y-3">
            <div className="h-6 w-2/3 bg-terracotta/15 dark:bg-burntOrange/15 rounded" />
            <div className="h-4 w-full bg-terracotta/10 dark:bg-burntOrange/10 rounded" />
            <div className="h-4 w-5/6 bg-terracotta/10 dark:bg-burntOrange/10 rounded" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-terracotta/10 dark:bg-burntOrange/10 rounded-full" />
              <div className="h-6 w-20 bg-terracotta/10 dark:bg-burntOrange/10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ProjectsGallery() {
  const { data: projects, loading, error } = useApiData('/api/projects');
  const list = projects || [];
  return (
    <section
      id="projects"
      className="w-full py-16 md:py-24 px-6 md:px-10 lg:px-16
        bg-cream/40 dark:bg-deepBrown/40"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="section-title font-display text-3xl md:text-4xl lg:text-5xl
          font-bold text-softBrown dark:text-mustard mb-10 md:mb-14">
          Proyectos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 grid-flow-row-dense">
          {loading && <ProjectsLoading count={3} />}
          {!loading && error && <ProjectsError message={error} />}
          {!loading && !error && list.length === 0 && <ProjectsEmpty />}
          {!loading && !error && list.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsGallery;
