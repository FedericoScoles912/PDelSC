/**
 * Funciones de manipulación del DOM y renderizado
 */

/**
 * Muestra un toast animado
 * @param {string} message 
 * @param {string} type 'success' | 'error' | 'info'
 */
export const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Eliminar después de la animación
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

/**
 * Renderiza la lista de números como chips
 * @param {number[]} numbers 
 * @param {Function} onDelete Callback para eliminar un número
 */
export const renderNumbers = (numbers, onDelete) => {
    const list = document.getElementById('numbers-list');
    
    if (numbers.length === 0) {
        list.innerHTML = '<p class="empty-msg">No hay números ingresados aún.</p>';
        return;
    }
    
    list.innerHTML = '';
    numbers.forEach((num, index) => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            <span>${num}</span>
            <button class="btn-close" aria-label="Eliminar">&times;</button>
        `;
        
        chip.querySelector('.btn-close').onclick = () => onDelete(index);
        list.appendChild(chip);
    });
};

/**
 * Actualiza el contador y la barra de progreso
 * @param {number} count 
 * @param {number} max 
 */
export const updateStats = (count, max) => {
    const counter = document.getElementById('counter');
    const fill = document.getElementById('progress-fill');
    const saveBtn = document.getElementById('save-btn');
    
    counter.textContent = `${count} / ${max} números ingresados`;
    const percentage = (count / max) * 100;
    fill.style.width = `${percentage}%`;
    
    // El botón guardar solo se habilita con al menos 10 números
    saveBtn.disabled = count < 10;
};

/**
 * Muestra un modal de confirmación personalizado
 * @param {string} title 
 * @param {string} message 
 * @returns {Promise<boolean>}
 */
export const showConfirm = (title, message) => {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.classList.remove('hidden');
        
        const cleanup = (result) => {
            overlay.classList.add('hidden');
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(result);
        };
        
        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
    });
};

/**
 * Maneja el cambio de tema (claro/oscuro)
 */
export const initTheme = () => {
    const toggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.replace('light-mode', 'dark-mode');
    }
    
    toggle.onclick = () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light');
        }
    };
};
