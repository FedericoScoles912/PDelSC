let fetchUsers = [];
let axiosUsers = [];

/**
 * Obtiene usuarios de la API usando Fetch.
 * @returns {Promise<Array>} Array de usuarios.
 */
async function fetchUsersWithFetch() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  return response.json();
}

/**
 * Obtiene usuarios de la API usando Axios.
 * @returns {Promise<Array>} Array de usuarios.
 */
async function fetchUsersWithAxios() {
  const response = await axios.get('https://jsonplaceholder.typicode.com/users');
  return response.data;
}

/**
 * Filtra usuarios por nombre (case-insensitive).
 * @param {Array} users - Array de usuarios.
 * @param {string} query - Texto de búsqueda.
 * @returns {Array} Usuarios filtrados.
 */
function filterUsersByName(users, query) {
  return users.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Renderiza tarjetas de usuarios en el DOM.
 * @param {Array} users - Array de objetos usuario.
 * @param {HTMLElement} container - Contenedor donde se renderizarán las tarjetas.
 */
function renderUserCards(users, container) {
  container.innerHTML = '';
  const cardsDiv = document.createElement('div');
  cardsDiv.className = 'user-cards';

  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'user-card';
    const name = document.createElement('h4');
    name.textContent = user.name;
    const email = document.createElement('p');
    email.textContent = user.email;
    card.appendChild(name);
    card.appendChild(email);
    cardsDiv.appendChild(card);
  });

  container.appendChild(cardsDiv);
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
 * Inicializa la carga de usuarios y los event listeners.
 */
async function init() {
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

  const fetchSearch = document.getElementById('fetchSearch');
  const fetchResults = document.getElementById('fetchResults');
  const axiosSearch = document.getElementById('axiosSearch');
  const axiosResults = document.getElementById('axiosResults');

  try {
    fetchUsers = await fetchUsersWithFetch();
    renderUserCards(fetchUsers, fetchResults);
  } catch (error) {
    showErrorMessage(error.message, fetchResults);
  }

  try {
    axiosUsers = await fetchUsersWithAxios();
    renderUserCards(axiosUsers, axiosResults);
  } catch (error) {
    showErrorMessage(error.message, axiosResults);
  }

  fetchSearch.addEventListener('input', (e) => {
    const filtered = filterUsersByName(fetchUsers, e.target.value);
    renderUserCards(filtered, fetchResults);
  });

  axiosSearch.addEventListener('input', (e) => {
    const filtered = filterUsersByName(axiosUsers, e.target.value);
    renderUserCards(filtered, axiosResults);
  });
}

document.addEventListener('DOMContentLoaded', init);
