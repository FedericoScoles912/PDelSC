/**
 * Valida que los campos del formulario no estén vacíos y que el nombre solo contenga letras.
 * @param {string} nombre - Nombre del usuario.
 * @param {string} email - Email del usuario.
 * @returns {boolean} True si válido, False si no.
 */
function validateFormFields(nombre, email) {
  const trimmedNombre = nombre.trim();
  const trimmedEmail = email.trim();
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return trimmedNombre !== '' && trimmedEmail !== '' && nameRegex.test(trimmedNombre);
}

/**
 * Realiza un POST usando Fetch.
 * @param {string} nombre - Nombre del usuario.
 * @param {string} email - Email del usuario.
 * @returns {Promise<Object>} Respuesta de la API.
 */
async function postDataWithFetch(nombre, email) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, email })
  });
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  return response.json();
}

/**
 * Realiza un POST usando Axios.
 * @param {string} nombre - Nombre del usuario.
 * @param {string} email - Email del usuario.
 * @returns {Promise<Object>} Respuesta de la API.
 */
async function postDataWithAxios(nombre, email) {
  const response = await axios.post('https://jsonplaceholder.typicode.com/posts', { nombre, email });
  return response.data;
}

/**
 * Muestra un mensaje de éxito en el DOM.
 * @param {number} id - ID devuelto por la API.
 * @param {HTMLElement} container - Contenedor donde se mostrará el mensaje.
 */
function showSuccessMessage(id, container) {
  container.innerHTML = '';
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = `Datos enviados exitosamente! ID recibido: ${id}`;
  container.appendChild(successDiv);
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
 * Manejador para el formulario de Fetch.
 * @param {Event} e - Evento del formulario.
 */
async function handleFetchFormSubmit(e) {
  e.preventDefault();
  const nombre = document.getElementById('fetchName').value;
  const email = document.getElementById('fetchEmail').value;
  const container = document.getElementById('fetchResults');

  if (!validateFormFields(nombre, email)) {
    showErrorMessage('Por favor, complete todos los campos.', container);
    return;
  }

  try {
    const data = await postDataWithFetch(nombre, email);
    showSuccessMessage(data.id, container);
  } catch (error) {
    showErrorMessage(error.message, container);
  }
}

/**
 * Manejador para el formulario de Axios.
 * @param {Event} e - Evento del formulario.
 */
async function handleAxiosFormSubmit(e) {
  e.preventDefault();
  const nombre = document.getElementById('axiosName').value;
  const email = document.getElementById('axiosEmail').value;
  const container = document.getElementById('axiosResults');

  if (!validateFormFields(nombre, email)) {
    showErrorMessage('Por favor, complete todos los campos y asegúrese que el nombre solo contenga letras (sin números ni signos).', container);
    return;
  }

  try {
    const data = await postDataWithAxios(nombre, email);
    showSuccessMessage(data.id, container);
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

  document.getElementById('fetchForm').addEventListener('submit', handleFetchFormSubmit);
  document.getElementById('axiosForm').addEventListener('submit', handleAxiosFormSubmit);
}

document.addEventListener('DOMContentLoaded', init);
