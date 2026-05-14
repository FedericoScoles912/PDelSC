import * as ui from './ui.js';

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileError = document.getElementById('file-error');
const processBtn = document.getElementById('process-btn');

/**
 * Inicialización
 */
const init = () => {
    ui.initTheme();
    
    fileInput.onchange = handleFileSelect;
    form.onsubmit = handleUpload;
};

/**
 * Maneja la selección de archivo y validación básica
 */
const handleFileSelect = (e) => {
    const file = e.target.files[0];
    fileError.textContent = "";
    
    if (!file) {
        fileInfo.textContent = "No se ha seleccionado archivo";
        processBtn.disabled = true;
        return;
    }

    if (!file.name.endsWith('.txt')) {
        fileError.textContent = "Solo se aceptan archivos .txt";
        processBtn.disabled = true;
        return;
    }

    if (file.size === 0) {
        fileError.textContent = "el archivo no puede estar vacío";
        processBtn.disabled = true;
        return;
    }

    fileInfo.textContent = `Archivo seleccionado: ${file.name}`;
    processBtn.disabled = false;
};

/**
 * Envía el archivo al servidor para procesar
 */
const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('archivo', file);

    try {
        processBtn.disabled = true;
        processBtn.textContent = "Procesando...";
        
        const response = await fetch('/procesar', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Error al procesar el archivo");
        }

        const data = await response.json();
        ui.renderResults(data);
        ui.showToast("Archivo procesado con éxito", "success");
        
    } catch (err) {
        ui.showToast(err.message, "error");
        fileError.textContent = err.message;
    } finally {
        processBtn.disabled = false;
        processBtn.textContent = "Procesar Archivo";
    }
};

document.addEventListener('DOMContentLoaded', init);
