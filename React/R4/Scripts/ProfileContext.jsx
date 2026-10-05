import { createContext, useContext, useEffect, useState } from 'react';

const defaultProfile = {
  full_name: 'Federico Scoles',
  role: 'Programador en desarrollo',
  tagline: 'Estudiante de informática interesado en Inteligencia Artificial, Machine Learning y desarrollo Front End.',
  email: 'fedescoles2007@gmail.com',
  phone: '+54 223 581-1876',
  city: 'Mar del Plata, Argentina',
  github_url: 'https://github.com/FedericoScoles912',
  linkedin_url: 'https://www.linkedin.com/in/federico-scoles-584a50378/',
  profile_image_url: '',
  about_paragraphs: [
    'Soy Federico Scoles, un programador en desarrollo que busca insertarse en el mundo laboral para adquirir experiencia profesional y desarrollo personal. Actualmente estudio el nivel secundario y estoy pensando en estudiar Ingeniería en Informática en la Facultad de Ingeniería de la UNMDP.',
    'Me gusta todo lo que tiene que ver con la Inteligencia Artificial, Machine Learning y el Front End de páginas web.',
    'Soy trabajador, comprometido y tengo excelente predisposición para aprender cosas nuevas.',
  ],
  languages: ['Español (nativo)', 'Inglés (C1+)'],
  hobbies: ['Gimnasio', 'Arte enfocado en la música', 'Running'],
};

const ProfileContext = createContext({ profile: defaultProfile, loading: true });

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/profile`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setProfile((current) => ({
        ...current,
        ...data,
        about_paragraphs: Array.isArray(data.about_paragraphs) && data.about_paragraphs.length ? data.about_paragraphs : current.about_paragraphs,
        languages: Array.isArray(data.languages) && data.languages.length ? data.languages : current.languages,
        hobbies: Array.isArray(data.hobbies) && data.hobbies.length ? data.hobbies : current.hobbies,
      })))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
