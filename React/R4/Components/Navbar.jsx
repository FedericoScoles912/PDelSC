// ============================================================
// Components/Navbar.jsx
// Barra de navegación sticky con efecto blur, toggle de tema
// (sol/luna) y scrollspy para resaltar el enlace activo.
// ============================================================
import { motion } from 'framer-motion';
import { useTheme } from '../Scripts/ThemeContext.jsx';
import useScrollSpy from '../Scripts/useScrollSpy.js';
import Icon from './Icon.jsx';

/**
 * Navbar: navegación principal fija en la parte superior.
 * - Fondo semi-transparente con blur de fondo.
 * - Botón para alternar entre tema claro y oscuro.
 * - Scrollspy que marca la sección visible en la vista.
 */
export default function Navbar() {
  // Hook para manejar el tema (claro/oscuro)
  const { theme, toggleTheme } = useTheme();

  // IDs de las 7 secciones que el scrollspy debe observar
  const sectionIds = [
    'hero',
    'about',
    'skills',
    'achievements',
    'experience',
    'projects',
    'contact',
  ];

  // ID de la sección actualmente visible en viewport
  const activeId = useScrollSpy(sectionIds);

  // Array con los enlaces de navegación (etiqueta + href)
  const navLinks = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Sobre mí', href: '#about' },
    { label: 'Habilidades', href: '#skills' },
    { label: 'Logros', href: '#achievements' },
    { label: 'Experiencia', href: '#experience' },
    { label: 'Proyectos', href: '#projects' },
    { label: 'Contacto', href: '#contact' },
  ];

  // Iniciales que se muestran como logo a la izquierda
  const initials = '[INICIALES]';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full backdrop-blur
                 bg-cream/80 dark:bg-deepBrown/80
                 border-b border-terracotta/20 dark:border-burntOrange/20
                 shadow-warm/30 dark:shadow-warmDark/30"
    >
      <motion.section
        className="section-container !py-3 flex items-center justify-between"
        layout
      >
        {/* Logo / Iniciales (izquierda) */}
        <a
          href="#hero"
          className="font-display text-2xl font-bold
                     text-terracotta dark:text-burntOrange
                     hover:scale-105 transition-transform"
        >
          {initials}
        </a>

        {/* Enlaces de navegación (centro) - visibles a partir de md */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            // Extraemos el id desde el href (quitamos el #)
            const id = link.href.slice(1);
            const isActive = activeId === id;

            return (
              <li key={id}>
                <a
                  href={link.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Botón toggle de tema (derecha) */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          className="p-2 rounded-lg
                     bg-terracotta/10 dark:bg-burntOrange/15
                     text-terracotta dark:text-mustard
                     hover:bg-terracotta/20 dark:hover:bg-burntOrange/25
                     transition-colors duration-300"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
        </button>
      </motion.section>
    </motion.nav>
  );
}
