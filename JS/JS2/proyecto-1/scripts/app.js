import * as ui from './ui.js';
import * as utils from './utils.js';

// Estado de la aplicación
const state = {
    numbers: [],
    maxNumbers: 20,
    minNumbers: 10
};

// Elementos del DOM
const form = document.getElementById('number-form');
const input = document.getElementById('number-input');
const errorMsg = document.getElementById('input-error');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');

/**
 * Inicialización
 */
const init = () => {
    ui.initTheme();
    render();
    
    form.onsubmit = handleAddNumber;
    clearBtn.onclick = handleClear;
    saveBtn.onclick = handleSave;

    // Bloquear caracteres no numéricos como 'e', 'E', '.', ','
    input.onkeydown = (e) => {
        const invalidChars = ['e', 'E', '.', ','];
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    };
};

/**
 * Renderiza el estado actual en la UI
 */
const render = () => {
    ui.renderNumbers(state.numbers, handleDeleteNumber);
    ui.updateStats(state.numbers.length, state.maxNumbers);
    
    // Deshabilitar entrada si se llega al máximo
    const isFull = state.numbers.length >= state.maxNumbers;
    input.disabled = isFull;
    form.querySelector('button[type="submit"]').disabled = isFull;
    
    if (isFull) {
        errorMsg.textContent = "Has alcanzado el límite de 20 números.";
    } else {
        errorMsg.textContent = "";
    }
};

/**
 * Agrega un nuevo número
 */
const handleAddNumber = (e) => {
    e.preventDefault();
    const val = input.value;
    
    if (val === "") {
        errorMsg.textContent = "El campo no puede estar vacío.";
        return;
    }
    
    if (!utils.isInteger(val)) {
        errorMsg.textContent = "Solo se aceptan números enteros.";
        return;
    }
    
    if (state.numbers.length >= state.maxNumbers) {
        return;
    }
    
    state.numbers.push(parseInt(val));
    input.value = "";
    input.focus();
    render();
    ui.showToast("Número agregado con éxito", "success");
};

/**
 * Elimina un número por índice
 */
const handleDeleteNumber = (index) => {
    state.numbers.splice(index, 1);
    render();
    ui.showToast("Número eliminado", "info");
};

/**
 * Limpia toda la lista
 */
const handleClear = async () => {
    if (state.numbers.length === 0) return;
    
    const confirmed = await ui.showConfirm(
        "Limpiar Lista", 
        "¿Estás seguro de que quieres borrar todos los números?"
    );
    
    if (confirmed) {
        state.numbers = [];
        render();
        ui.showToast("Lista vaciada", "success");
    }
};

/**
 * Guarda el archivo TXT vía servidor
 */
const handleSave = async () => {
    if (state.numbers.length < state.minNumbers) {
        ui.showToast(`Se requieren al menos ${state.minNumbers} números.`, "error");
        return;
    }
    
    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Guardando...";
        
        const response = await fetch('/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numeros: state.numbers })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            ui.showToast(`¡Archivo guardado! ${data.archivo}`, "success");
        } else {
            throw new Error(data.error || "Error al guardar");
        }
    } catch (err) {
        ui.showToast(err.message, "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Guardar TXT";
    }
};

// Iniciar app
document.addEventListener('DOMContentLoaded', init);
