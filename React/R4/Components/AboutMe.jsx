// ============================================================
// Components/AboutMe.jsx
// Sección "Sobre mí". Cumple con la consigna de usar la GRID
// de Bootstrap (.container / .row / .col-md-5 / .col-md-7).
// Columna 5: avatar + imagen placeholder.
// Columna 7: título, párrafos descriptivos y badges.
// ============================================================
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import Badge from './Badge.jsx';
import Icon from './Icon.jsx';

/**
 * AboutMe: sección descriptiva personal con layout Bootstrap.
 * Utiliza motion.section como wrapper y section-container para
 * el layout de Tailwind.
 */
export default function AboutMe() {
  // Datos personales placeholder (reemplazar por información real)
  const fullName = '[Tu nombre]';
  const avatarSrc = '[URL_AVATAR_PLACEHOLDER]';
  const profileImageSrc = '[URL_IMAGEN_PERFIL_PLACEHOLDER]';
  const city = '[Tu ciudad]';
  const availability = 'Disponible para proyectos';
  const languages = ['Español (nativo)', 'Inglés (intermedio)'];

  // Párrafos descriptivos (reemplazar texto placeholder)
  const paragraphs = [
    '¡Hola! Soy Federico Scoles, un Desarrollador de Programación Informática. Con 4 años de experiencia en Desarrollo Web y App Development, me especializo en Desarrollo Web.',
    'Me caracterizo por mi pasión por la tecnología y mi compromiso con la calidad. Disfruto enfrentar desafíos técnicos y colaborar en equipos multidisciplinarios para construir soluciones digitales que generen valor real.',
    'En mi tiempo libre, me gusta entrenar, programar, cantar y leer la palabra de Dios. Siempre estoy en búsqueda de aprender nuevas herramientas y mejorar mis habilidades constantemente.',
  ];

  return (
    <motion.section
      id="about"
      className="section-container bg-section-warm"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* === GRID DE BOOTSTRAP (container / row / col-md-*) === */}
      <div className="container">
        <div className="row gy-8 align-items-center">
          {/* ---------- COLUMNA 5/12: Avatar + imagen ---------- */}
          <div className="col-md-5">
            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Avatar tamaño lg con iniciales fallback */}
              <Avatar
                src={avatarSrc}
                alt={`Avatar de ${fullName}`}
                name={fullName}
                size="lg"
              />

              {/* Imagen placeholder adicional (foto ilustrativa) */}
              <div className="w-full max-w-sm overflow-hidden rounded-2xl
                              border-4 border-mustard/50 dark:border-burntOrange/50
                              shadow-warm dark:shadow-warmDark">
                <img
                  src={profileImageSrc}
                  alt={`Foto de perfil de ${fullName}`}
                  onError={(e) => {
                    // Fallback: si la imagen falla, mostramos un bloque
                    // decorativo en lugar de una imagen rota
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (!parent.querySelector('.img-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'img-fallback w-full h-64 flex items-center justify-center ' +
                        'bg-terracotta/15 dark:bg-burntOrange/20 ' +
                        'text-softBrown/60 dark:text-mustard/70 ' +
                        'text-sm font-medium';
                      fallback.textContent = '[IMAGEN PLACEHOLDER]';
                      parent.appendChild(fallback);
                    }
                  }}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>

          {/* ---------- COLUMNA 7/12: Título + texto + badges ---------- */}
          <div className="col-md-7">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Título de sección (clase global .section-title) */}
              <h2 className="section-title">Sobre mí</h2>

              {/* Párrafos descriptivos */}
              <div className="flex flex-col gap-4 mb-8 text-softBrown dark:text-mutedBeige text-base md:text-lg leading-relaxed">
                {paragraphs.map((text, idx) => (
                  <p key={idx}>{text}</p>
                ))}
              </div>

              {/* Badges: ubicación, disponibilidad, idiomas */}
              <div className="flex flex-wrap gap-3">
                <Badge
                  color="terracotta"
                  icon={<Icon name="location" size={14} />}
                >
                  {city}
                </Badge>

                <Badge
                  color="olive"
                  icon={<Icon name="check" size={14} />}
                >
                  {availability}
                </Badge>

                {languages.map((lang) => (
                  <Badge
                    key={lang}
                    color="mustard"
                    icon={<Icon name="star" size={14} />}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
