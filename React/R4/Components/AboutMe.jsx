// ============================================================
// Components/AboutMe.jsx
// Sección "Sobre mí". Cumple con la consigna de usar la GRID
// de Bootstrap (.container / .row / .col-md-5 / .col-md-7).
// Columna 5: avatar.
// Columna 7: título, párrafos descriptivos y badges.
// ============================================================
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import Badge from './Badge.jsx';
import Icon from './Icon.jsx';
import profilePhoto from '../Assets/profile/federico-scoles.jpg';
import { useProfile } from '../Scripts/ProfileContext.jsx';

/**
 * AboutMe: sección descriptiva personal con layout Bootstrap.
 * Utiliza motion.section como wrapper y section-container para
 * el layout de Tailwind.
 */
export default function AboutMe() {
  const { profile } = useProfile();
  const { full_name: fullName, city, languages = [], about_paragraphs: paragraphs = [], hobbies = [] } = profile;
  const avatarSrc = profile.profile_image_url || profilePhoto;

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

              {/* Badges: ubicación e idiomas */}
              <div className="flex flex-wrap gap-3">
                <Badge
                  color="terracotta"
                  icon={<Icon name="location" size={14} />}
                >
                  {city}
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
                {hobbies.map((hobby) => (
                  <Badge key={hobby} color="olive">{hobby}</Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
