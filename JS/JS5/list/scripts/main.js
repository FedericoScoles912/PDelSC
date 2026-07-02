const API_URL = 'http://localhost:3001/api/alumnos';

let alumnos = [];

const leaderboardContainer = document.getElementById('leaderboard-container');
const loading = document.getElementById('loading');
const refreshBtn = document.getElementById('refresh-btn');
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
  // Ordenamos por edad (o podríamos por nombre/apellido)
  return json.data.sort((a, b) => b.edad - a.edad);
}

/**
 * Obtiene el emoji de medalla según la posición
 * @param {number} position - Posición (1,2,3,...)
 */
function getMedalEmoji(position) {

  return `#${position}`;
}

/**
 * Obtiene la clase según la posición
 * @param {number} position - Posición
 */
function getPositionClass(position) {

  return '';
}

/**
 * Renderiza el leaderboard
 */
function renderLeaderboard() {
  leaderboardContainer.innerHTML = '';
  
  if (alumnos.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = 'No hay alumnos registrados aún.';
    leaderboardContainer.appendChild(emptyDiv);
    return;
  }

  const leaderboard = document.createElement('div');
  leaderboard.className = 'leaderboard';

  alumnos.forEach((alumno, index) => {
    const position = index + 1;
    const item = document.createElement('div');
    item.className = `leaderboard-item ${getPositionClass(position)}`;
    
    const positionEl = document.createElement('div');
    positionEl.className = 'leaderboard-position';
    positionEl.textContent = getMedalEmoji(position);
    
    const info = document.createElement('div');
    info.className = 'leaderboard-info';
    
    const name = document.createElement('div');
    name.className = 'leaderboard-name';
    name.textContent = `${alumno.nombre} ${alumno.apellido}`;
    
    const edad = document.createElement('div');
    edad.className = 'leaderboard-detail';
    edad.textContent = `ID: ${alumno.id} • Edad: ${alumno.edad} años`;
    
    info.appendChild(name);
    info.appendChild(edad);
    
    const score = document.createElement('div');
    score.className = 'leaderboard-score';
    score.textContent = `${alumno.edad}`;
    
    item.appendChild(positionEl);
    item.appendChild(info);
    item.appendChild(score);
    
    leaderboard.appendChild(item);
  });

  leaderboardContainer.appendChild(leaderboard);
}

/**
 * Carga la lista de alumnos desde la API
 */
async function loadAlumnos() {
  try {
    loading.style.display = 'block';
    leaderboardContainer.innerHTML = '';
    alumnos = await fetchAlumnos();
    renderLeaderboard();
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
 * Inicializa la página
 */
function init() {
  initTheme();
  loadAlumnos();

  themeToggle.addEventListener('click', toggleTheme);
  refreshBtn.addEventListener('click', loadAlumnos);
}

document.addEventListener('DOMContentLoaded', init);
