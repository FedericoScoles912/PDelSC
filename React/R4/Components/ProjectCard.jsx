// ============================================================
// Components/ProjectCard.jsx  (Molécula)
// Tarjeta de proyecto: imagen, título, descripción, tags,
// botones Repo/Demo. Animación hover (lift + sombra).
// ============================================================
import { motion } from 'framer-motion';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';
import { Icon } from './Icon.jsx';

/**
 * @param {Object} props
 * @param {Number} props.id
 * @param {String} props.title
 * @param {String} [props.description]
 * @param {String} [props.repo_url]
 * @param {String} [props.demo_url]
 * @param {String} [props.image_url]
 * @param {String[]} [props.tags]
 * @param {Boolean} [props.featured=false]
 */
export function ProjectCard({
  id,
  title,
  description = '',
  repo_url,
  demo_url,
  image_url,
  tags = [],
  featured = false,
}) {
  return (
    <motion.article
      key={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className={`group flex flex-col rounded-2xl overflow-hidden
        bg-white/65 dark:bg-deepBrown/45
        border border-terracotta/15 dark:border-burntOrange/15
        shadow-warm dark:shadow-warmDark
        transition-all duration-300
        ${featured ? 'md:col-span-2 lg:row-span-1' : ''}`}
    >
      {/* Imagen (placeholder si no existe) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-olive/30 via-terracotta/30 to-mustard/30 dark:from-burntOrange/40 dark:via-deepBrown dark:to-mustard/30">
        {image_url ? (
          <img
            src={image_url}
            alt={`Proyecto: ${title}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-cream/90 dark:text-deepBrown/80">
            <span className="font-display text-2xl md:text-3xl font-bold drop-shadow">
              {title}
            </span>
          </div>
        )}
        {featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge color="mustard" icon={<Icon name="star" size={14} />}>
              Destacado
            </Badge>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex-1 flex flex-col gap-4 p-5 md:p-6">
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-softBrown dark:text-mustard">
            {title}
          </h3>
          <p className="mt-2 text-sm md:text-base leading-relaxed text-softBrown/80 dark:text-mutedBeige">
            {description || '[Descripción breve del proyecto]'}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} color="olive">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-auto pt-3 flex flex-wrap gap-3">
          {repo_url && (
            <a
              href={repo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Repositorio de ${title}`}
            >
              <Button variant="ghost" size="sm">
                <Icon name="github" size={16} />
                Repositorio
              </Button>
            </a>
          )}
          {demo_url && (
            <a
              href={demo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Demo de ${title}`}
            >
              <Button variant="primary" size="sm">
                <Icon name="external-link" size={16} />
                Demo
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default ProjectCard;
