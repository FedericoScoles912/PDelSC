// ============================================================
// Components/HeroSection.jsx
// Sección de bienvenida principal (Hero). Muestra avatar,
// nombre, rol, tagline, botones de acción y redes sociales.
// Utiliza animación escalonada (stagger) con Framer Motion.
// ============================================================
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

/**
 * Variantes de Framer Motion para la animación stagger:
 * - container: controla el retardo escalonado entre hijos
 * - item: cada elemento hijo se anima con estas props
 */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/**
 * HeroSection: primera sección visible del portfolio.
 * Layout flex-col en móvil, flex-row en md+.
 */
export default function HeroSection() {
  // Datos personales placeholder (reemplazar por valores reales)
  const fullName = '[Tu nombre]';
  const role = '[Tu Rol]';
  const tagline =
    '[Tagline / frase breve que te describa como profesional]';
  const avatarSrc = '[URL_AVATAR_PLACEHOLDER]';

  // Enlaces a redes sociales (placeholders, reemplazar URLs reales)
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
    <motion.section
      id="hero"
      className="section-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <motion.div
        variants={itemVariants}
        className="min-h-[90vh] w-full flex flex-col md:flex-row
                   items-center justify-center gap-10"
      >
        {/* Columna izquierda / superior: Avatar */}
        <motion.div variants={itemVariants} className="flex-shrink-0">
          <Avatar
            src={avatarSrc}
            alt={`Avatar de ${fullName}`}
            name={fullName}
            size="xl"
          />
        </motion.div>

        {/* Columna derecha / inferior: Texto + botones + redes */}
        <div className="flex flex-col items-center md:items-start gap-6 max-w-xl">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold
                       text-softBrown dark:text-mustard text-center md:text-left
                       leading-tight"
          >
            {fullName}
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-3xl font-semibold
                       text-terracotta dark:text-burntOrange
                       text-center md:text-left"
          >
            {role}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-softBrown/90 dark:text-mutedBeige
                       text-center md:text-left leading-relaxed"
          >
            {tagline}
          </motion.p>

          {/* Botones de acción: Descargar CV + Contacto */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4"
          >
            <a href="/Assets/cv.pdf" download>
              <Button variant="primary" size="lg">
                <Icon name="download" size={20} />
                Descargar CV
              </Button>
            </a>

            <a href="#contact">
              <Button variant="secondary" size="lg">
                <Icon name="send" size={20} />
                Contacto
              </Button>
            </a>
          </motion.div>

          {/* Íconos sociales: GitHub / LinkedIn / Mail */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 pt-2"
          >
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="p-3 rounded-full
                           bg-terracotta/10 dark:bg-burntOrange/15
                           text-softBrown dark:text-mustard
                           hover:bg-terracotta hover:text-cream
                           dark:hover:bg-burntOrange dark:hover:text-deepBrown
                           transition-all duration-300 hover:scale-110"
              >
                <Icon name={social.name} size={24} />
              </a>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
