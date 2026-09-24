// ============================================================
// Components/ProjectsGallery.jsx  (Sección)
// Galería de proyectos con flujo automático. Los proyectos
// destacados (featured=true) ocupan md:col-span-2.
// Datos desde /api/projects.
// ============================================================
import useApiData from '../Scripts/useApiData.js';
import { ProjectCard } from './ProjectCard.jsx';

export function ProjectsGallery() {
  const { data: projects, loading, error } = useApiData('/api/projects');

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

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 grid-flow-row-dense">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`aspect-[4/3] rounded-2xl bg-softBrown/5 dark:bg-mutedBeige/10 animate-pulse ${i === 0 ? 'md:col-span-2' : ''}`}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-softBrown/70 dark:text-mutedBeige">
            <p className="font-semibold">No se pudieron cargar los proyectos.</p>
            <p className="text-sm mt-1">Inténtalo nuevamente más tarde.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 grid-flow-row-dense">
            {(projects || []).map((project) => (
              <ProjectCard
                key={project.id}
                className={project.featured ? 'md:col-span-2' : ''}
                {...project}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectsGallery;
