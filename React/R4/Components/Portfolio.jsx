// ============================================================
// Components/Portfolio.jsx  (Página / Template)
// Ensambla todos los organismos en una sola página con
// navegación por anclas, scroll smooth y animaciones por
// sección. Envuelve la app en NotificationProvider.
// ============================================================
import { motion } from 'framer-motion';
import { NotificationProvider } from '../Scripts/NotificationContext.jsx';

// Los organismos definen su propia <section id="..."> internamente
// (tanto los export default como los named exports). Aquí solo
// importamos cada componente con su nombre de función correcto
// y le dejamos a cada uno la responsabilidad de su sección.
import Navbar from './Navbar.jsx';
import HeroSection from './HeroSection.jsx';
import AboutMe from './AboutMe.jsx';
import { SkillsSection } from './SkillsSection.jsx';
import AchievementsSection from './AchievementsSection.jsx';
import { ExperienceTimeline } from './ExperienceTimeline.jsx';
import { ProjectsGallery } from './ProjectsGallery.jsx';
import { ContactForm } from './ContactForm.jsx';
import Footer from './Footer.jsx';

// Variante reutilizable para animación de entrada por sección
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Wrapper de animación: sin id ni padding; solo dispara motion
// para que la animación se aplique sobre cada organismo.
function Animated({ children, amount = 0.2 }) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function Portfolio() {
  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col bg-cream dark:bg-deepBrown text-softBrown dark:text-mutedBeige transition-colors duration-500">
        {/* Navbar sticky */}
        <Navbar />

        {/* Contenido principal */}
        <main className="flex-1">
          {/* 1. Hero */}
          <Animated amount={0.2}>
            <HeroSection />
          </Animated>

          {/* 2. Sobre mí */}
          <Animated amount={0.2}>
            <AboutMe />
          </Animated>

          {/* 3. Habilidades */}
          <Animated amount={0.15}>
            <SkillsSection />
          </Animated>

          {/* 4. Logros & certificaciones */}
          <Animated amount={0.15}>
            <AchievementsSection />
          </Animated>

          {/* 5. Experiencia laboral (timeline) */}
          <Animated amount={0.15}>
            <ExperienceTimeline />
          </Animated>

          {/* 6. Proyectos realizados */}
          <Animated amount={0.1}>
            <ProjectsGallery />
          </Animated>

          {/* 7. Contacto */}
          <Animated amount={0.3}>
            <ContactForm />
          </Animated>
        </main>

        {/* 8. Footer */}
        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default Portfolio;
