/**
 * UI para el Proyecto 2
 */

export const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

export const initTheme = () => {
    const toggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') body.classList.replace('light-mode', 'dark-mode');
    
    toggle.onclick = () => {
        const isLight = body.classList.contains('light-mode');
        body.classList.toggle('light-mode', !isLight);
        body.classList.toggle('dark-mode', isLight);
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
    };
};

/**
 * Renderiza los resultados del análisis
 * @param {Object} data 
 */
export const renderResults = (data) => {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');

    // Estadísticas
    document.getElementById('stat-total').textContent = data.total;
    document.getElementById('stat-useful').textContent = data.utiles;
    document.getElementById('stat-discarded').textContent = data.descartados;
    document.getElementById('stat-percent').textContent = data.porcentaje;
    document.getElementById('stat-progress-fill').style.width = `${data.porcentaje}%`;

    // Lista Filtrada
    const filteredList = document.getElementById('filtered-list');
    filteredList.innerHTML = '';
    data.numerosFiltrados.forEach(num => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = num;
        filteredList.appendChild(chip);
    });

    // Lista Factoriales
    const factorialList = document.getElementById('factorial-list');
    factorialList.innerHTML = '';
    if (data.factoriales.length === 0) {
        factorialList.innerHTML = '<li class="text-muted">No se detectaron factoriales.</li>';
    } else {
        data.factoriales.forEach(f => {
            const li = document.createElement('li');
            li.textContent = `${f.num} = ${f.n}!`;
            factorialList.appendChild(li);
        });
    }

    // Botón Descarga
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = `/descargar/${data.archivoResultado}`;
    downloadLink.classList.remove('hidden');
    downloadLink.textContent = `Descargar ${data.archivoResultado}`;
};
