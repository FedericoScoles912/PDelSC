const ROUTES = [
    {
        path: '/',
        label: 'Inicio',
        file: 'home.html',
        category: 'Portada',
        title: 'Noticias, tecnologia y actualidad en una sola experiencia',
        lead: 'Un diario online con contenido local, navegacion clara y arquitectura modular servida con Node.js.'
    },
    {
        path: '/politica',
        label: 'Politica',
        file: 'politica.html',
        category: 'Actualidad institucional',
        title: 'Politica local con foco en gestion publica y transformacion digital',
        lead: 'Analisis y cobertura de decisiones publicas que impactan en la vida cotidiana de la comunidad.'
    },
    {
        path: '/economia',
        label: 'Economia',
        file: 'economia.html',
        category: 'Desarrollo productivo',
        title: 'Economia real: comercio, consumo y adaptacion de los negocios barriales',
        lead: 'Historias y tendencias sobre como se reorganizan los actores economicos frente a nuevos habitos.'
    },
    {
        path: '/tecnologia',
        label: 'Tecnologia',
        file: 'tecnologia.html',
        category: 'Innovacion aplicada',
        title: 'Tecnologia y educacion: aprender a construir proyectos mantenibles',
        lead: 'Cobertura sobre herramientas, desarrollo web y propuestas formativas ligadas al mundo tecnico.'
    },
    {
        path: '/cultura',
        label: 'Cultura',
        file: 'cultura.html',
        category: 'Comunidad',
        title: 'Cultura local: bibliotecas, lectura y memoria en movimiento',
        lead: 'Una mirada a los espacios que conectan territorio, archivo y acceso al conocimiento.'
    },
    {
        path: '/deportes',
        label: 'Deportes',
        file: 'deportes.html',
        category: 'Formacion y salud',
        title: 'Deportes de cercania con nuevas herramientas para entrenar mejor',
        lead: 'El deporte barrial suma tecnologia sin perder su identidad social y educativa.'
    },
    {
        path: '/calculadora',
        label: 'Calculadora',
        file: 'home.html', // We'll handle custom content in renderer
        category: 'Herramientas',
        title: 'Calculadora Matematica',
        lead: 'Una herramienta util para tus calculos rapidos integrada en el diario.'
    },
    {
        path: '/clima',
        label: 'Clima',
        file: 'home.html', // We'll handle custom content in renderer
        category: 'Servicios',
        title: 'Pronostico del Tiempo',
        lead: 'Consulta el estado del clima y las previsiones para las proximas horas.'
    }
];

const getRoute = (pathname) => ROUTES.find((route) => route.path === pathname);

module.exports = {
    ROUTES,
    getRoute
};
