// ============================================================
// Components/SkillsSection.jsx  (Sección)
// Muestra la grilla de habilidades obtenidas desde /api/skills.
// Grid responsivo: 1 columna (sm:2, lg:3, xl:4).
// ============================================================
import { SkillCard } from './SkillCard.jsx';

const skills = [
  { id: 'html', name: 'HTML', category: 'Desarrollo frontend' },
  { id: 'css', name: 'CSS', category: 'Desarrollo frontend' },
  { id: 'javascript', name: 'JavaScript', category: 'Desarrollo frontend' },
  { id: 'react', name: 'ReactJS', category: 'Desarrollo frontend' },
  { id: 'node', name: 'NodeJS', category: 'Desarrollo Backend' },
  { id: 'python', name: 'Python', category: 'Desarrollo Backend' },
  { id: 'sql', name: 'SQL', category: 'Base de Datos' },
  { id: 'cpp', name: 'C++', category: 'Desarrollo de aplicaciones' },
  { id: 'kotlin', name: 'Kotlin', category: 'Desarrollo de aplicaciones' },
];

export function SkillsSection() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill.id} {...skill} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SkillsSection;
