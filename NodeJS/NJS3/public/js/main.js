// Lógica del Portal de Noticias - Inyección de Artículos y Modal
document.addEventListener('DOMContentLoaded', () => {
    const articleData = {
        '1': {
            title: 'Tecnología: El futuro de la IA',
            content: 'La inteligencia artificial no es solo una moda pasajera; es la piedra angular de la próxima revolución industrial. Desde el procesamiento del lenguaje natural hasta la visión por computadora, la IA está automatizando tareas complejas y permitiendo a los desarrolladores centrarse en la innovación creativa. En los próximos diez años, esperamos ver una integración aún más profunda en dispositivos domésticos y sistemas de gestión urbana.'
        },
        '2': {
            title: 'Medio Ambiente: Energías Renovables',
            content: 'Investigadores han desarrollado un nuevo tipo de panel solar que utiliza materiales orgánicos para capturar la luz en el espectro infrarrojo. Esto permite generar electricidad incluso en días muy nublados o durante el atardecer, superando una de las mayores limitaciones de la energía fotovoltaica tradicional. Este avance podría reducir los costos de energía en un 30% para finales de la década.'
        },
        '3': {
            title: 'Deportes: Selección Nacional gana el mundial',
            content: 'En una final histórica que se definió en los últimos minutos del tiempo extra, la selección nacional se consagró campeona del mundo. El capitán del equipo levantó el trofeo ante una multitud de 80,000 espectadores, marcando el inicio de una celebración nacional sin precedentes.'
        },
        '4': {
            title: 'Cultura: Nuevo museo de arte digital',
            content: 'La ciudad inaugura hoy el primer museo dedicado exclusivamente al arte digital y los NFTs. Con proyecciones inmersivas de 360 grados y galerías de realidad aumentada, el museo busca acercar las nuevas formas de expresión tecnológica a todo el público.'
        },
        '5': {
            title: 'Economía: El mercado cripto repunta',
            content: 'Tras meses de volatilidad, las principales criptomonedas han mostrado una recuperación sólida del 15% en la última semana. Analistas atribuyen este crecimiento a la aprobación de nuevos marcos regulatorios que brindan mayor seguridad a los inversores institucionales.'
        }
    };

    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    const modalTitle = document.getElementById('articleModalLabel');
    const modalBody = document.getElementById('article-modal-body');

    // Añadir escuchadores de eventos a todos los botones "Leer más"
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('read-more')) {
            const articleId = event.target.getAttribute('data-article-id');
            const article = articleData[articleId];

            if (article) {
                modalTitle.textContent = article.title;
                modalBody.innerHTML = `<p>${article.content}</p>`;
                modal.show();
            }
        }
    });
});
