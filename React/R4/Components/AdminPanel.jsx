import { useEffect, useState } from 'react';
import { request } from '../Scripts/apiClient.js';

const sections = [
  { key: 'skills', title: 'Habilidades', endpoint: '/api/skills', fields: [['name', 'Tecnología'], ['category', 'Categoría'], ['level', 'Nivel (0-100)', 'number']] },
  { key: 'projects', title: 'Proyectos', endpoint: '/api/projects', fields: [['title', 'Título'], ['description', 'Descripción', 'textarea'], ['demo_url', 'URL pública'], ['repo_url', 'URL repositorio'], ['image_url', 'URL imagen'], ['tags', 'Tecnologías (separadas por coma)'], ['featured', 'Destacado', 'checkbox']] },
  { key: 'experiences', title: 'Experiencia', endpoint: '/api/experiences', fields: [['role', 'Puesto'], ['company', 'Empresa'], ['start_date', 'Fecha inicio', 'date'], ['end_date', 'Fecha fin', 'date'], ['location', 'Ubicación'], ['description', 'Descripción', 'textarea']] },
  { key: 'achievements', title: 'Certificaciones', endpoint: '/api/achievements', fields: [['title', 'Título'], ['issuer', 'Entidad'], ['date_earned', 'Fecha', 'date'], ['description', 'Descripción', 'textarea'], ['certificate_url', 'URL certificado']] },
];

const blankFor = (section) => Object.fromEntries(section.fields.map(([name, , type]) => [name, type === 'checkbox' ? false : '']));
const normalize = (item) => ({ ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '', end_date: item.end_date?.slice(0, 10) || '', start_date: item.start_date?.slice(0, 10) || '', date_earned: item.date_earned?.slice(0, 10) || '' });
const apiBase = import.meta.env.VITE_API_BASE_URL || '';

function Field({ field, value, onChange }) {
  const [name, label, type = 'text'] = field;
  if (type === 'checkbox') return <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(name, event.target.checked)} /> {label}</label>;
  const props = { value: value ?? '', onChange: (event) => onChange(name, event.target.value), className: 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500', type };
  return <label className="block text-sm font-medium text-slate-700">{label}{type === 'textarea' ? <textarea {...props} rows="3" /> : <input {...props} />}</label>;
}

function CollectionEditor({ section, items, refresh }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setError('');
    const payload = { ...editing };
    if ('tags' in payload) payload.tags = payload.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    try { await request(`${section.endpoint}${payload.id ? `/${payload.id}` : ''}`, payload.id ? 'PUT' : 'POST', payload); setEditing(null); refresh(); } catch (err) { setError(err.message); }
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{section.title}</h2><button className="admin-button" onClick={() => setEditing(blankFor(section))}>Agregar</button></div>
    <div className="space-y-2">{items.map((item) => <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3" key={item.id}><span className="text-sm font-medium">{item.name || item.title || item.role}</span><div className="flex gap-2"><button className="admin-link" onClick={() => setEditing(normalize(item))}>Editar</button><button className="admin-link text-red-600" onClick={async () => { if (confirm('¿Eliminar este elemento?')) { await request(`${section.endpoint}/${item.id}`, 'DELETE'); refresh(); } }}>Eliminar</button></div></div>)}</div>
    {editing && <form onSubmit={save} className="mt-5 grid gap-3 border-t pt-5"><h3 className="font-semibold">{editing.id ? 'Editar' : 'Nuevo'} registro</h3>{section.fields.map((field) => <Field key={field[0]} field={field} value={editing[field[0]]} onChange={(name, value) => setEditing((current) => ({ ...current, [name]: value }))} />)}{error && <p className="text-sm text-red-600">{error}</p>}<div className="flex gap-2"><button className="admin-button" type="submit">Guardar</button><button className="admin-link" type="button" onClick={() => setEditing(null)}>Cancelar</button></div></form>}
  </section>;
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState({});
  const [message, setMessage] = useState('');
  const load = async () => { const entries = await Promise.all(sections.map(async (section) => [section.key, await fetch(apiBase + section.endpoint).then((response) => response.json())])); setData(Object.fromEntries(entries)); setProfile(await fetch(apiBase + '/api/profile').then((response) => response.json())); };
  useEffect(() => { fetch(apiBase + '/api/auth/session', { credentials: 'include' }).then((response) => response.json()).then(({ authenticated }) => { setAuthenticated(authenticated); if (authenticated) load(); }).catch(() => setAuthenticated(false)); }, []);
  const login = async (event) => { event.preventDefault(); try { await request('/api/auth/login', 'POST', credentials); setAuthenticated(true); load(); } catch (error) { setMessage(error.message); } };
  const saveProfile = async (event) => { event.preventDefault(); try { await request('/api/profile', 'PUT', { ...profile, about_paragraphs: profile.about_paragraphs_text.split('\n').filter(Boolean), languages: profile.languages_text.split(',').map((value) => value.trim()).filter(Boolean), hobbies: profile.hobbies_text.split(',').map((value) => value.trim()).filter(Boolean) }); setMessage('Perfil guardado.'); } catch (error) { setMessage(error.message); } };
  if (authenticated === null) return <main className="admin-shell">Cargando panel…</main>;
  if (!authenticated) return <main className="admin-shell"><form className="admin-login" onSubmit={login}><p className="text-sm font-semibold text-sky-600">PORTFOLIO</p><h1>Administración</h1><input placeholder="Usuario" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} /><input type="password" placeholder="Contraseña" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />{message && <p className="text-red-600 text-sm">{message}</p>}<button className="admin-button">Ingresar</button></form></main>;
  if (!profile) return <main className="admin-shell">Cargando contenido…</main>;
  const profileForm = { ...profile, about_paragraphs_text: profile.about_paragraphs_text ?? (profile.about_paragraphs || []).join('\n'), languages_text: profile.languages_text ?? (profile.languages || []).join(', '), hobbies_text: profile.hobbies_text ?? (profile.hobbies || []).join(', ') };
  return <main className="admin-shell"><header className="admin-header"><div><p className="text-sm font-semibold text-sky-600">PANEL ADMIN</p><h1>Contenido del portfolio</h1></div><div className="flex gap-4"><a className="admin-link" href="/">Ver sitio</a><button className="admin-link" onClick={async () => { await request('/api/auth/logout', 'POST'); setAuthenticated(false); }}>Salir</button></div></header>{message && <p className="mb-4 text-sm text-sky-700">{message}</p>}<form className="admin-profile" onSubmit={saveProfile}><h2 className="text-lg font-bold">Información personal</h2>{[['full_name', 'Nombre'], ['role', 'Rol'], ['tagline', 'Presentación'], ['email', 'Email'], ['phone', 'Teléfono'], ['city', 'Ciudad'], ['github_url', 'GitHub'], ['linkedin_url', 'LinkedIn'], ['profile_image_url', 'URL de foto'], ['about_paragraphs_text', 'Sobre mí (un párrafo por línea)', 'textarea'], ['languages_text', 'Idiomas (separados por coma)'], ['hobbies_text', 'Pasatiempos (separados por coma)']].map((field) => <Field key={field[0]} field={field} value={profileForm[field[0]]} onChange={(name, value) => setProfile((current) => ({ ...current, [name]: value }))} />)}<button className="admin-button">Guardar perfil</button></form><div className="admin-grid">{sections.map((section) => <CollectionEditor key={section.key} section={section} items={data[section.key] || []} refresh={load} />)}</div></main>;
}
