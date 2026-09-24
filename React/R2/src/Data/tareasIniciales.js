/**
 * Array de tareas iniciales (mock data).
 * Cada tarea sigue la forma: { id, titulo, descripcion, fechaCreacion, completa }
 * @type {Array<Object>}
 */
const tareasIniciales = [
  {
    id: 't1',
    titulo: 'Configurar entorno de desarrollo',
    descripcion:
      'Instalar Node.js, Vite, React y todas las dependencias necesarias para comenzar el proyecto. Incluye configuración de ESLint y Prettier.',
    fechaCreacion: '2024-09-15T09:30:00.000Z',
    completa: true
  },
  {
    id: 't2',
    titulo: 'Diseñar paleta de colores otoñal',
    descripcion:
      'Definir la paleta de tonos relajados (beige, terracota, oliva, chocolate) en tailwind.config.js y aplicarla a temas claro y oscuro.',
    fechaCreacion: '2024-09-16T11:00:00.000Z',
    completa: true
  },
  {
    id: 't3',
    titulo: 'Implementar Context API de Tareas',
    descripcion:
      'Crear TareasContext con estado global, funciones para agregar, eliminar, toggle y exportar JSON. Integrar en toda la app.',
    fechaCreacion: '2024-09-17T14:15:00.000Z',
    completa: true
  },
  {
    id: 't4',
    titulo: 'Crear página de listado Home',
    descripcion:
      'Diseñar la grilla responsive de tareas con Bootstrap + Tailwind, integrar TareaItem y botón para exportar JSON.',
    fechaCreacion: '2024-09-18T08:45:00.000Z',
    completa: false
  },
  {
    id: 't5',
    titulo: 'Desarrollar página de detalle dinámico',
    descripcion:
      'Capturar :id desde useParams(), buscar la tarea, mostrar badge de estado, fecha formateada y botón volver. Manejar 404.',
    fechaCreacion: '2024-09-19T16:20:00.000Z',
    completa: false
  },
  {
    id: 't6',
    titulo: 'Página de creación con formulario controlado',
    descripcion:
      'Formulario con título, descripción y switch de completitud. Validación mínima, UUID automático y redirect con useNavigate().',
    fechaCreacion: '2024-09-20T10:00:00.000Z',
    completa: false
  },
  {
    id: 't7',
    titulo: 'Implementar modo claro/oscuro',
    descripcion:
      'Agregar ThemeContext con persistencia en localStorage, toggle en el Navbar y estilos condicionales en todos los componentes.',
    fechaCreacion: '2024-09-21T13:30:00.000Z',
    completa: false
  },
  {
    id: 't8',
    titulo: 'Sistema de notificaciones Toast',
    descripcion:
      'Reemplazar todos los alert() por un componente Toast propio con tipos (éxito, error, info) y auto-ocultamiento.',
    fechaCreacion: '2024-09-22T15:45:00.000Z',
    completa: false
  },
  {
    id: 't9',
    titulo: 'Pruebas de responsive design',
    descripcion:
      'Verificar correcta visualización en mobile (375px), tablet (768px) y desktop 1920x1080. Ajustar breakpoints de Bootstrap.',
    fechaCreacion: '2024-09-23T09:00:00.000Z',
    completa: false
  },
  {
    id: 't10',
    titulo: 'Documentar proyecto en README',
    descripcion:
      'Redactar guía de instalación, estructura de rutas, descripción de páginas y decisiones de arquitectura del proyecto.',
    fechaCreacion: '2024-09-24T17:30:00.000Z',
    completa: false
  }
];

export default tareasIniciales;
