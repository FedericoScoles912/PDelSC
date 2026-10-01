// ============================================================
// Components/ExperienceTimeline.jsx  (Sección)
// Línea de tiempo de experiencia laboral. Cada item envuelve
// ExperienceItem en un TimelineItem que alterna lados según el índice.
// ============================================================
import { TimelineItem } from './TimelineItem.jsx';
import { ExperienceItem } from './ExperienceItem.jsx';

const experiences = [
  {
    id: 'pasante-repuestos-motor-2026',
    role: 'Pasante',
    company: 'Tienda de repuestos de motor',
    period: 'Marzo 2026',
    description: '• Cumplí un rol de ayudante bajo relación de dependencia.\n• Realicé actividades digitales y físicas: facturación, mantenimiento de stock y ofimática.\n• Referencia de contacto: Mariano Andrés Scoles (+54 223 456-8010).',
  },
];

export function ExperienceTimeline() {
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
          {experiences.map((exp, i) => (
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
