/**
 * Obtiene alumnos de la API propia usando Fetch.
 * @returns {Promise<Array>} Array de alumnos.
 */
async function fetchAlumnosWithFetch() {
  const response = await fetch('/api/alumnos');
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  return response.json();
}

/**
 * Obtiene alumnos de la API propia usando Axios.
 * @returns {Promise<Array>} Array de alumnos.
 */
async function fetchAlumnosWithAxios() {
  const response = await axios.get('/api/alumnos');
  return response.data;
}

/**
 * Renderiza una tabla de alumnos en el DOM.
 * @param {Array} alumnos - Array de objetos alumno.
 * @param {HTMLElement} container - Contenedor donde se renderizará la tabla.
 */
function renderAlumnosTable(alumnos, container) {
  container.innerHTML = '';
  const table = document.createElement('table');
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['ID', 'Nombre', 'Email', 'Curso'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  alumnos.forEach(alumno => {
    const row = document.createElement('tr');
    [alumno.id, alumno.nombre, alumno.email, alumno.curso].forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  container.appendChild(table);
}

/**
 * Muestra un mensaje de error en el DOM.
 * @param {string} message - Mensaje de error.
 * @param {HTMLElement} container - Contenedor donde se mostrará el error.
 */
function showErrorMessage(message, container) {
  container.innerHTML = '';
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  container.appendChild(errorDiv);
}

/**
 * Manejador para el botón de Fetch.
 */
async function handleFetchClick() {
  const container = document.getElementById('fetchResults');
  const fetchBtn = document.getElementById('fetchBtn');
  const axiosBtn = document.getElementById('axiosBtn');
  
  try {
    const alumnos = await fetchAlumnosWithFetch();
    renderAlumnosTable(alumnos, container);
    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Alumnos Cargados';
  } catch (error) {
    showErrorMessage(error.message, container);
  }
}

/**
 * Manejador para el botón de Axios.
 */
async function handleAxiosClick() {
  const container = document.getElementById('axiosResults');
  const fetchBtn = document.getElementById('fetchBtn');
  const axiosBtn = document.getElementById('axiosBtn');
  
  try {
    const alumnos = await fetchAlumnosWithAxios();
    renderAlumnosTable(alumnos, container);
    axiosBtn.disabled = true;
    axiosBtn.textContent = 'Alumnos Cargados';
  } catch (error) {
    showErrorMessage(error.message, container);
  }
}

/**
 * Inicializa los event listeners y el tema.
 */
function init() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
  });

  document.getElementById('fetchBtn').addEventListener('click', handleFetchClick);
  document.getElementById('axiosBtn').addEventListener('click', handleAxiosClick);
}

document.addEventListener('DOMContentLoaded', init);
