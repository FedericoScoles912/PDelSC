// ============================================================
// Components/Footer.jsx
// Pie de página del portfolio. Incluye:
// - Fondo cálido: bg-section-warm
// - Íconos sociales: GitHub / LinkedIn / Mail (links _blank)
// - Copyright dinámico (año actual via new Date())
// - Enlace placeholder al repositorio Git del proyecto
// ============================================================
import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

/**
 * Footer: pie de página fijo al final del documento.
 * Usa motion.section como wrapper y section-container para
 * el layout responsive.
 */
export default function Footer() {
  // Datos placeholder (reemplazar por valores reales)
  const fullName = '[Tu nombre]';
  const currentYear = new Date().getFullYear();

  // Enlace placeholder al repositorio Git del portfolio
  const repoUrl = '[LINK_REPOSITORIO_GIT]';

  // Redes sociales (mismos placeholders que HeroSection para
  // mantener consistencia; reemplazar URLs reales)
  const socialLinks = [
    {
      name: 'github',
      href: 'https://github.com/[TU_USUARIO_GITHUB]',
      label: 'Perfil de GitHub',
    },
    {
      name: 'linkedin',
      href: 'https://linkedin.com/in/[TU_USUARIO_LINKEDIN]',
      label: 'Perfil de LinkedIn',
    },
    {
      name: 'mail',
      href: 'mailto:[TU_CORREO@EJEMPLO.COM]',
      label: 'Enviar correo',
    },
  ];

  return (
    <motion.footer
      id="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-section-warm
                 border-t border-terracotta/20 dark:border-burntOrange/20"
    >
      <motion.section className="section-container !py-10">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* ===== Fila 1: Íconos sociales ===== */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
                className="p-2.5 rounded-full
                           bg-terracotta/10 dark:bg-burntOrange/15
                           text-softBrown dark:text-mustard
                           hover:bg-terracotta hover:text-cream
                           dark:hover:bg-burntOrange dark:hover:text-deepBrown
                           transition-all duration-300 hover:scale-110"
              >
                <Icon name={social.name} size={20} />
              </a>
            ))}
          </div>

          {/* ===== Fila 2: Copyright + enlace al repositorio ===== */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4
                          text-sm text-softBrown/80 dark:text-mutedBeige">
            {/* Copyright con año dinámico */}
            <p className="font-medium">
              &copy; {fullName} {currentYear}
              <span className="mx-2 text-terracotta/60 dark:text-burntOrange/60">|</span>
              Todos los derechos reservados
            </p>

            {/* Enlace al repositorio Git (placeholder) */}
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold
                         text-terracotta dark:text-burntOrange
                         hover:underline underline-offset-4
                         transition-colors"
            >
              <Icon name="github" size={16} />
              Repositorio
            </a>
          </div>
        </div>
      </motion.section>
    </motion.footer>
  );
}
