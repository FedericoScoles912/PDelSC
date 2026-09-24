import EjercicioWrapper from './EjercicioWrapper.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';
import { capitalizar } from '../Scripts/helpers.js';

function Tarjeta({ nombre, apellido, profesion, imagen }) {
  const { isDark } = useTheme();
  const nombreCompleto = `${capitalizar(nombre)} ${capitalizar(apellido)}`;

  return (
    <article
      className={`card-base p-4 text-center d-flex flex-column align-items-center gap-3
        hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 cursor-default`}
    >
      <div className="position-relative">
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-70 transition-opacity
            ${isDark ? 'bg-dark-mostaza/40' : 'bg-light-terracota/40'}`}
          style={{ filter: 'blur(10px)', transform: 'scale(0.95)' }}
        />
        <img
          src={imagen}
          alt={`Foto de ${nombreCompleto}`}
          loading="lazy"
          className={`rounded-circle object-fit-cover position-relative border-3 border-opacity-80
          ${isDark ? 'border-dark-mostaza' : 'border-light-terracota'}`}
          style={{ width: '130px', height: '130px', border: '3px solid', borderColor: 'currentColor', objectFit: 'cover' }}
        />
      </div>

      <div>
        <h3
          className={`m-0 fs-4 fw-bold ${isDark ? 'text-dark-mostaza' : 'text-light-terracota'}`}
        >
          {nombreCompleto}
        </h3>
        <p className="m-0 mt-1 texto-claro fst-italic">
          {capitalizar(profesion)}
        </p>
      </div>

      <div
        className={`mt-2 w-100 py-2 rounded-pill
          ${isDark ? 'bg-dark-gris' : 'bg-light-beige'}`}
        style={{ height: '4px' }}
      />
    </article>
  );
}

export default function TarjetaPresentacion() {
  const personas = [
    {
      nombre: 'maría',
      apellido: 'lópez',
      profesion: 'diseñadora ux/ui',
      imagen: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
    },
    {
      nombre: 'juan',
      apellido: 'pérez',
      profesion: 'desarrollador frontend',
      imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    {
      nombre: 'ana',
      apellido: 'martínez',
      profesion: 'product manager',
      imagen: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80'
    }
  ];

  return (
    <EjercicioWrapper
      numero={2}
      titulo="Tarjeta de presentación"
      descripcion="Componente reutilizable que recibe nombre, apellido, profesión e imagen mediante props."
    >
      <div className="row g-4">
        {personas.map((p, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-4">
            <Tarjeta {...p} />
          </div>
        ))}
      </div>
    </EjercicioWrapper>
  );
}
