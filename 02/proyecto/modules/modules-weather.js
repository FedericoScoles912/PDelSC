const CONDITIONS = [
    { label: 'Despejado', icon: 'Sun', bootstrap: 'text-warning' },
    { label: 'Parcialmente nublado', icon: 'CloudSun', bootstrap: 'text-info' },
    { label: 'Nublado', icon: 'Clouds', bootstrap: 'text-secondary' },
    { label: 'Lluvia ligera', icon: 'CloudRain', bootstrap: 'text-primary' }
];

export const getWeatherData = (city = 'Buenos Aires') => {
    const now = new Date();
    const hour = now.getHours();
    const condition = CONDITIONS[hour % CONDITIONS.length];
    const temperature = 16 + ((hour * 3) % 11);
    const humidity = 58 + ((hour * 7) % 22);
    const wind = 8 + ((hour * 5) % 12);

    return {
        city,
        temperature,
        humidity,
        wind,
        condition: condition.label,
        icon: condition.icon,
        accentClass: condition.bootstrap,
        updatedAt: now.toLocaleString('es-AR'),
        summary: `En ${city} hay ${condition.label.toLowerCase()} con ${temperature}°C y viento de ${wind} km/h.`
    };
};

export const renderWeatherWidget = (weather) => `
    <section class="card shadow-sm border-0 h-100 weather-widget">
        <div class="card-body p-4">
            <p class="section-kicker mb-2">Modulo del clima</p>
            <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
                <div>
                    <h2 class="h4 mb-1">${weather.city}</h2>
                    <p class="text-secondary mb-0">${weather.updatedAt}</p>
                </div>
                <i data-lucide="${weather.icon}" class="${weather.accentClass} weather-icon"></i>
            </div>
            <p class="display-6 fw-bold mb-1">${weather.temperature}°C</p>
            <p class="fw-semibold mb-2">${weather.condition}</p>
            <p class="text-secondary mb-4">${weather.summary}</p>
            <div class="row g-3 text-center">
                <div class="col-6">
                    <div class="weather-metric rounded-4 p-3">
                        <p class="small text-secondary mb-1">Humedad</p>
                        <p class="fw-bold mb-0">${weather.humidity}%</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="weather-metric rounded-4 p-3">
                        <p class="small text-secondary mb-1">Viento</p>
                        <p class="fw-bold mb-0">${weather.wind} km/h</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;
