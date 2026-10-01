// ============================================================
// Components/ProjectsGallery.jsx  (Sección)
// Galería de proyectos con flujo automático. Los proyectos
// destacados (featured=true) ocupan md:col-span-2.
// Datos de proyectos del portfolio.
// ============================================================
import { ProjectCard } from './ProjectCard.jsx';

const projects = [
  {
    id: 'iglesia-de-jesus',
    title: 'Página web Iglesia de Jesús',
    description: 'Página web oficial publicada a través de cPanel mediante una herramienta de gestión web.',
    demo_url: 'https://iglesiadejesus.com.ar',
    tags: ['cPanel', 'Gestor web'],
    featured: true,
  },
];

export function ProjectsGallery() {
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
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsGallery;
