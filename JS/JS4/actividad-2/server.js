const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// In-memory "database"
let users = [
  { id: 1, nombre: "Juan Pérez", email: "juan@example.com" },
  { id: 2, nombre: "María Gómez", email: "maria@example.com" }
];
let nextId = 3;

// Rutas CRUD
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener todos los usuarios
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Crear un usuario
app.post('/api/users', (req, res) => {
  const { nombre, email } = req.body;
  const newUser = { id: nextId++, nombre, email };
  users.push(newUser);
  res.json(newUser);
});

// Actualizar un usuario
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], nombre, email };
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
});

// Eliminar un usuario
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    res.json(deletedUser);
  } else {
    res.status(404).json({ error: "Usuario no encontrado" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Actividad 2 corriendo en http://localhost:${PORT}`);
});