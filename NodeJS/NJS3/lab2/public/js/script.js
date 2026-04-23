document.addEventListener('DOMContentLoaded', () => {
    const feedback = document.getElementById('event-feedback');
    const components = {
        'event-card': 'mouseover',
        'event-alert': 'dblclick',
        'event-btn': 'contextmenu',
        'event-badge': 'click',
        'event-list': 'mouseout'
    };

    Object.entries(components).forEach(([id, eventType]) => {
        const el = document.getElementById(id);
        el.addEventListener(eventType, (e) => {
            if (eventType === 'contextmenu') e.preventDefault();
            feedback.innerHTML = `<span class="badge bg-dark">Evento: ${eventType} en ${id}</span>`;
            el.classList.add('border-primary', 'border-3');
            setTimeout(() => el.classList.remove('border-primary', 'border-3'), 500);
        });
    });
});
