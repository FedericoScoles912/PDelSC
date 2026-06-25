// Validación: nombre solo letras, acentos y espacios
function validateFormFields(nombre, email) {
  const trimmedNombre = nombre.trim();
  const trimmedEmail = email.trim();
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return trimmedNombre !== '' && trimmedEmail !== '' && nameRegex.test(trimmedNombre);
}

// Funciones API con Axios
async function getUsers() {
  const response = await axios.get('/api/users');
  return response.data;
}

async function createUser(nombre, email) {
  const response = await axios.post('/api/users', { nombre, email });
  return response.data;
}

async function updateUser(id, nombre, email) {
  const response = await axios.put(`/api/users/${id}`, { nombre, email });
  return response.data;
}

async function deleteUser(id) {
  const response = await axios.delete(`/api/users/${id}`);
  return response.data;
}

// Renderizar lista de usuarios
function renderUsers(users) {
  const userList = document.getElementById('userList');
  userList.innerHTML = '';
  
  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'col-md-6 mb-3';
    userCard.innerHTML = `
      <div class="card p-3">
        <h5 class="card-title">${user.nombre}</h5>
        <p class="card-text">${user.email}</p>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}">Editar</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Eliminar</button>
        </div>
      </div>
    `;
    userList.appendChild(userCard);
  });
  
  // Añadir event listeners a botones de editar y eliminar
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => handleEditUser(btn.dataset.id));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteUser(btn.dataset.id));
  });
}

// Resetear formulario
function resetForm() {
  document.getElementById('formTitle').textContent = 'Nuevo Usuario';
  document.getElementById('userId').value = '';
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('cancelBtn').classList.add('d-none');
}

// Cargar usuarios al iniciar
async function loadUsers() {
  try {
    const users = await getUsers();
    renderUsers(users);
  } catch (error) {
    console.error(error);
  }
}

// Handler para formulario (crear/actualizar)
async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('userId').value;
  const nombre = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;

  if (!validateFormFields(nombre, email)) {
    alert('Por favor, complete todos los campos y asegúrese que el nombre solo contenga letras (sin números ni signos).');
    return;
  }

  try {
    if (id) {
      await updateUser(parseInt(id), nombre, email);
    } else {
      await createUser(nombre, email);
    }
    resetForm();
    loadUsers();
  } catch (error) {
    console.error(error);
  }
}

// Handler para editar usuario
function handleEditUser(id) {
  const users = []; // We'll get the users from the API again (or store them in state)
  getUsers().then(users => {
    const user = users.find(u => u.id === parseInt(id));
    if (user) {
      document.getElementById('formTitle').textContent = 'Editar Usuario';
      document.getElementById('userId').value = user.id;
      document.getElementById('userName').value = user.nombre;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('cancelBtn').classList.remove('d-none');
    }
  });
}

// Handler para eliminar usuario
async function handleDeleteUser(id) {
  if (confirm('¿Seguro que quieres eliminar este usuario?')) {
    try {
      await deleteUser(parseInt(id));
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  }
}

function init() {
  // Tema oscuro/claro
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

  // Event listeners
  document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);

  // Cargar usuarios iniciales
  loadUsers();
}

document.addEventListener('DOMContentLoaded', init);