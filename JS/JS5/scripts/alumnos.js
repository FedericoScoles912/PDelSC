const API_URL = 'http://localhost:3000/api/alumnos';

let alumnos = [];

const contentContainer = document.getElementById('content-container');
const loading = document.getElementById('loading');
const reloadBtn = document.getElementById('reload-btn');
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
 * Establece el link activo en el menú
 */
function setActiveNav() {
  const currentPath = window.location.pathname;
  const links = {
    '../index.html': 'nav-home',
    'alumnos.html': 'nav-alumnos',
    'formulario.html': 'nav-formulario',
    'fetch.html': 'nav-fetch',
    'axios.html': 'nav-axios'
  };
  
  for (const [path, id] of Object.entries(links)) {
    const el = document.getElementById(id);
    if (el && currentPath.includes(path)) {
      el.classList.add('active');
    }
  }
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
 * Renderiza las tarjetas de alumnos
 */
function renderCards() {
  contentContainer.innerHTML = '';
  
  if (alumnos.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = 'No hay alumnos registrados aún.';
    contentContainer.appendChild(emptyDiv);
    return;
  }

  const cardsGrid = document.createElement('div');
  cardsGrid.className = 'cards-grid';

  alumnos.forEach(alumno => {
    const card = document.createElement('article');
    card.className = 'alumno-card';

    const idBadge = document.createElement('span');
    idBadge.className = 'alumno-id';
    idBadge.textContent = `#${alumno.id}`;

    const nombreEl = document.createElement('h2');
    nombreEl.className = 'alumno-nombre';
    nombreEl.textContent = `${alumno.nombre} ${alumno.apellido}`;

    const edadEl = document.createElement('p');
    edadEl.className = 'alumno-edad';
    edadEl.textContent = `Edad: ${alumno.edad}`;

    card.appendChild(idBadge);
    card.appendChild(nombreEl);
    card.appendChild(edadEl);
    cardsGrid.appendChild(card);
  });

  contentContainer.appendChild(cardsGrid);
}

/**
 * Carga la lista de alumnos desde la API
 */
async function loadAlumnos() {
  try {
    loading.style.display = 'block';
    contentContainer.innerHTML = '';
    alumnos = await fetchAlumnos();
    renderCards();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'No se pudo conectar con la API. Asegúrate de que el servidor esté corriendo en http://localhost:3000';
      contentContainer.appendChild(errorDiv);
    } else {
      showToast(error.message, 'error');
    }
    console.error(error);
  } finally {
    loading.style.display = 'none';
  }
}

/**
 * Inicializa la página
 */
function init() {
  initTheme();
  setActiveNav();
  loadAlumnos();

  themeToggle.addEventListener('click', toggleTheme);
  reloadBtn.addEventListener('click', loadAlumnos);
}

document.addEventListener('DOMContentLoaded', init);
