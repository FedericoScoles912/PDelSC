const API_URL = 'http://localhost:3001/api/alumnos';

let alumnos = [];
let editingId = null;

const alumnoForm = document.getElementById('alumno-form');
const alumnoIdInput = document.getElementById('alumno-id');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const edadInput = document.getElementById('edad');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const tableContainer = document.getElementById('table-container');
const loading = document.getElementById('loading');
const themeToggle = document.getElementById('theme-toggle');

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success/error)
 */
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Inicializa el tema desde localStorage
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

/**
 * Actualiza el texto del botón de tema
 * @param {string} theme - Tema actual
 */
function updateThemeButton(theme) {
  themeToggle.textContent = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
}

/**
 * Alterna entre modo claro y oscuro
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

/**
 * Limpia todos los errores de validación
 */
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

/**
 * Muestra un mensaje de error debajo de un campo
 * @param {string} fieldId - ID del campo
 * @param {string} message - Mensaje de error
 */
function showError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

/**
 * Valida nombre y apellido
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {object} Resultado de la validación
 */
function validateNombreApellido(value, fieldName) {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} es requerido` };
  }
  if (value.trim().length < 2) {
    return { valid: false, message: `${fieldName} debe tener al menos 2 caracteres` };
  }
  if (value.length > 100) {
    return { valid: false, message: `${fieldName} no puede exceder 100 caracteres` };
  }
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!regex.test(value)) {
    return { valid: false, message: `${fieldName} solo puede contener letras y espacios` };
  }
  return { valid: true };
}

/**
 * Valida la edad
 * @param {string|number} value - Edad a validar
 * @returns {object} Resultado de la validación
 */
function validateEdad(value) {
  if (!value) {
    return { valid: false, message: 'Edad es requerida', field: 'edad' };
  }
  const edad = Number(value);
  if (isNaN(edad) || !Number.isInteger(edad)) {
    return { valid: false, message: 'Edad debe ser un número entero', field: 'edad' };
  }
  if (edad < 1 || edad > 120) {
    return { valid: false, message: 'Edad debe estar entre 1 y 120', field: 'edad' };
  }
  return { valid: true };
}

/**
 * Valida todo el formulario
 * @returns {boolean} true si es válido, false en caso contrario
 */
function validateForm() {
  clearErrors();
  let isValid = true;

  const nombreValidation = validateNombreApellido(nombreInput.value, 'Nombre');
  if (!nombreValidation.valid) {
    showError('nombre', nombreValidation.message);
    isValid = false;
  }

  const apellidoValidation = validateNombreApellido(apellidoInput.value, 'Apellido');
  if (!apellidoValidation.valid) {
    showError('apellido', apellidoValidation.message);
    isValid = false;
  }

  const edadValidation = validateEdad(edadInput.value);
  if (!edadValidation.valid) {
    showError('edad', edadValidation.message);
    isValid = false;
  }

  return isValid;
}

/**
 * Obtiene todos los alumnos desde la API usando Fetch
 * @returns {Promise<Array>} Lista de alumnos
 */
async function fetchAlumnos() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

/**
 * Crea un nuevo alumno en la API usando Fetch
 * @param {object} alumno - Datos del alumno
 * @returns {Promise<object>} Alumno creado
 */
async function createAlumno(alumno) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alumno)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return await response.json();
}

/**
 * Actualiza un alumno existente usando Fetch
 * @param {number} id - ID del alumno
 * @param {object} alumno - Datos del alumno
 * @returns {Promise<object>} Alumno actualizado
 */
async function updateAlumno(id, alumno) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alumno)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return await response.json();
}

/**
 * Elimina un alumno por ID usando Fetch
 * @param {number} id - ID del alumno
 * @returns {Promise<object>} Confirmación
 */
async function deleteAlumno(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return await response.json();
}

/**
 * Renderiza la lista de alumnos en filas grandes
 */
function renderTable() {
  tableContainer.innerHTML = '';
  
  if (alumnos.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = 'No hay alumnos registrados aún.';
    tableContainer.appendChild(emptyDiv);
    return;
  }

  const listWrapper = document.createElement('div');
  listWrapper.className = 'alumnos-list';

  alumnos.forEach(alumno => {
    const alumnoRow = document.createElement('div');
    alumnoRow.className = 'alumno-row';
    alumnoRow.dataset.id = alumno.id;

    // Info del alumno
    const infoDiv = document.createElement('div');
    infoDiv.className = 'alumno-info';

    const idSpan = document.createElement('span');
    idSpan.className = 'alumno-badge';
    idSpan.textContent = `ID ${alumno.id}`;

    const nombreDiv = document.createElement('div');
    nombreDiv.className = 'alumno-name';
    nombreDiv.textContent = `${alumno.nombre} ${alumno.apellido}`;

    const edadDiv = document.createElement('div');
    edadDiv.className = 'alumno-details';
    edadDiv.textContent = `Edad: ${alumno.edad} años`;

    infoDiv.appendChild(idSpan);
    infoDiv.appendChild(nombreDiv);
    infoDiv.appendChild(edadDiv);

    // Botones de acción
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'alumno-actions';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-edit';
    btnEdit.textContent = 'Editar';
    btnEdit.onclick = () => enableEditMode(alumno.id);

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn btn-delete';
    btnDelete.textContent = 'Eliminar';
    btnDelete.onclick = () => showDeleteConfirm(alumno.id);

    const deleteConfirm = document.createElement('div');
    deleteConfirm.className = 'delete-confirm-inline';
    deleteConfirm.id = `delete-confirm-${alumno.id}`;
    deleteConfirm.style.display = 'none';
    
    const spanConfirm = document.createElement('span');
    spanConfirm.textContent = '¿Seguro?';

    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'btn btn-confirm';
    btnConfirm.textContent = 'Confirmar';
    btnConfirm.onclick = () => handleDelete(alumno.id);

    const btnCancelDelete = document.createElement('button');
    btnCancelDelete.className = 'btn btn-cancel';
    btnCancelDelete.textContent = 'Cancelar';
    btnCancelDelete.onclick = () => hideDeleteConfirm(alumno.id);

    deleteConfirm.appendChild(spanConfirm);
    deleteConfirm.appendChild(btnConfirm);
    deleteConfirm.appendChild(btnCancelDelete);

    actionsDiv.appendChild(btnEdit);
    actionsDiv.appendChild(btnDelete);
    actionsDiv.appendChild(deleteConfirm);

    alumnoRow.appendChild(infoDiv);
    alumnoRow.appendChild(actionsDiv);

    listWrapper.appendChild(alumnoRow);
  });

  tableContainer.appendChild(listWrapper);
}

/**
 * Carga la lista de alumnos desde la API
 */
async function loadAlumnos() {
  try {
    loading.style.display = 'block';
    tableContainer.innerHTML = '';
    alumnos = await fetchAlumnos();
    renderTable();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      showToast('No se pudo conectar con la API. Asegúrate de que el servidor esté corriendo en http://localhost:3001', 'error');
    } else {
      showToast(error.message, 'error');
    }
    console.error(error);
  } finally {
    loading.style.display = 'none';
  }
}

/**
 * Activa el modo edición
 * @param {number} id - ID del alumno a editar
 */
function enableEditMode(id) {
  const alumno = alumnos.find(a => a.id === id);
  if (!alumno) return;

  editingId = id;
  alumnoIdInput.value = id;
  nombreInput.value = alumno.nombre;
  apellidoInput.value = alumno.apellido;
  edadInput.value = alumno.edad;
  formTitle.textContent = 'Editar Alumno';
  cancelBtn.style.display = 'inline-block';
  clearErrors();
}

/**
 * Desactiva el modo edición y limpia el formulario
 */
function disableEditMode() {
  editingId = null;
  alumnoIdInput.value = '';
  alumnoForm.reset();
  formTitle.textContent = 'Agregar Alumno';
  cancelBtn.style.display = 'none';
  clearErrors();
}

/**
 * Muestra la confirmación de eliminación inline
 * @param {number} id - ID del alumno
 */
function showDeleteConfirm(id) {
  document.querySelectorAll('.delete-confirm-inline').forEach(el => el.style.display = 'none');
  const confirmDiv = document.getElementById(`delete-confirm-${id}`);
  if (confirmDiv) {
    confirmDiv.style.display = 'flex';
  }
}

/**
 * Oculta la confirmación de eliminación
 * @param {number} id - ID del alumno
 */
function hideDeleteConfirm(id) {
  const confirmDiv = document.getElementById(`delete-confirm-${id}`);
  if (confirmDiv) {
    confirmDiv.style.display = 'none';
  }
}

/**
 * Maneja el submit del formulario
 * @param {Event} e - Evento del formulario
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    const data = {
      nombre: nombreInput.value.trim(),
      apellido: apellidoInput.value.trim(),
      edad: parseInt(edadInput.value, 10)
    };

    if (editingId) {
      await updateAlumno(editingId, data);
      showToast('Alumno actualizado correctamente', 'success');
    } else {
      await createAlumno(data);
      showToast('Alumno creado correctamente', 'success');
    }

    disableEditMode();
    loadAlumnos();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      showToast('No se pudo conectar con la API. Asegúrate de que el servidor esté corriendo en http://localhost:3001', 'error');
    } else if (error.field) {
      showError(error.field, error.message);
    } else {
      showToast(error.message, 'error');
    }
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
}

/**
 * Maneja la eliminación de un alumno
 * @param {number} id - ID del alumno
 */
async function handleDelete(id) {
  try {
    await deleteAlumno(id);
    showToast('Alumno eliminado correctamente', 'success');
    loadAlumnos();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      showToast('No se pudo conectar con la API. Asegúrate de que el servidor esté corriendo en http://localhost:3001', 'error');
    } else {
      showToast(error.message, 'error');
    }
    console.error(error);
  }
}

/**
 * Inicializa la página
 */
function init() {
  initTheme();
  loadAlumnos();

  themeToggle.addEventListener('click', toggleTheme);
  alumnoForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', disableEditMode);
}

document.addEventListener('DOMContentLoaded', init);
