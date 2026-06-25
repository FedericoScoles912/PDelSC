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
 * Manejador para el botón de Fetch.
 */
async function handleFetchClick() {
  const container = document.getElementById('fetchResults');
  try {
    const users = await fetchUsersWithFetch();
    renderUserCards(users, container);
  } catch (error) {
    showErrorMessage(error.message, container);
  }
}

/**
 * Manejador para el botón de Axios.
 */
async function handleAxiosClick() {
  const container = document.getElementById('axiosResults');
  try {
    const users = await fetchUsersWithAxios();
    renderUserCards(users, container);
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
