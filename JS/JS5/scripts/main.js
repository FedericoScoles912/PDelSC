const API_URL = '/api/alumnos';

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

function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
  themeToggle.textContent = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

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

function validateEdad(value) {
  if (!value) {
    return { valid: false, message: 'Edad es requerida' };
  }
  const edad = Number(value);
  if (isNaN(edad) || !Number.isInteger(edad)) {
    return { valid: false, message: 'Edad debe ser un número entero' };
  }
  if (edad < 1 || edad > 120) {
    return { valid: false, message: 'Edad debe estar entre 1 y 120' };
  }
  return { valid: true };
}

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

async function fetchAlumnos() {
  try {
    loading.style.display = 'block';
    tableContainer.innerHTML = '';
    const response = await fetch(API_URL);
    const result = await response.json();
    if (result.success) {
      alumnos = result.data;
      renderTable();
    } else {
      showToast(result.message, 'error');
    }
  } catch (error) {
    showToast('Error al cargar los alumnos', 'error');
    console.error(error);
  } finally {
    loading.style.display = 'none';
  }
}

function renderTable() {
  if (alumnos.length === 0) {
    tableContainer.innerHTML = '<div class="empty-state">No hay alumnos registrados</div>';
    return;
  }

  let tableHTML = `
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Edad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  alumnos.forEach(alumno => {
    tableHTML += `
      <tr data-id="${alumno.id}">
        <td>${sanitizeText(String(alumno.id))}</td>
        <td>${sanitizeText(alumno.nombre)}</td>
        <td>${sanitizeText(alumno.apellido)}</td>
        <td>${sanitizeText(String(alumno.edad))}</td>
        <td>
          <button class="btn btn-edit" onclick="enableEditMode(${alumno.id})">Editar</button>
          <button class="btn btn-delete" onclick="showDeleteConfirm(${alumno.id})">Eliminar</button>
          <div class="delete-confirm" id="delete-confirm-${alumno.id}" style="display: none;">
            <span>¿Seguro?</span>
            <button class="btn btn-confirm" onclick="deleteAlumno(${alumno.id})">Confirmar</button>
            <button class="btn btn-cancel" onclick="hideDeleteConfirm(${alumno.id})">Cancelar</button>
          </div>
        </td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  tableContainer.innerHTML = tableHTML;
}

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

function disableEditMode() {
  editingId = null;
  alumnoIdInput.value = '';
  alumnoForm.reset();
  formTitle.textContent = 'Agregar Alumno';
  cancelBtn.style.display = 'none';
  clearErrors();
}

function showDeleteConfirm(id) {
  document.querySelectorAll('.delete-confirm').forEach(el => el.style.display = 'none');
  const confirmDiv = document.getElementById(`delete-confirm-${id}`);
  if (confirmDiv) {
    confirmDiv.style.display = 'inline-flex';
  }
}

function hideDeleteConfirm(id) {
  const confirmDiv = document.getElementById(`delete-confirm-${id}`);
  if (confirmDiv) {
    confirmDiv.style.display = 'none';
  }
}

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

    let response;
    if (editingId) {
      response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    const result = await response.json();

    if (result.success) {
      showToast(editingId ? 'Alumno actualizado correctamente' : 'Alumno creado correctamente', 'success');
      disableEditMode();
      fetchAlumnos();
    } else {
      if (result.field) {
        showError(result.field, result.message);
      } else {
        showToast(result.message, 'error');
      }
    }
  } catch (error) {
    showToast('Error al guardar el alumno', 'error');
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
}

async function deleteAlumno(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showToast('Alumno eliminado correctamente', 'success');
      fetchAlumnos();
    } else {
      showToast(result.message, 'error');
    }
  } catch (error) {
    showToast('Error al eliminar el alumno', 'error');
    console.error(error);
  }
}

function init() {
  initTheme();
  fetchAlumnos();

  themeToggle.addEventListener('click', toggleTheme);
  alumnoForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', disableEditMode);
}

document.addEventListener('DOMContentLoaded', init);
