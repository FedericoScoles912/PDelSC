const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// In-memory "database" for Actividad 2
let users = [
  { id: 1, nombre: "Juan Pérez", email: "juan@example.com" },
  { id: 2, nombre: "María Gómez", email: "maria@example.com" }
];
let nextId = 3;

// In-memory "database" for Actividad 4
let alumnos = [
  { id: 1, nombre: "Carlos López", email: "carlos@example.com", curso: "5to Semestre" },
  { id: 2, nombre: "Ana Martínez", email: "ana@example.com", curso: "6to Semestre" }
];
let nextAlumnoId = 3;

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rutas para Actividad 2
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { nombre, email } = req.body;
  const newUser = { id: nextId++, nombre, email };
  users.push(newUser);
  res.json(newUser);
});

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

// Rutas para Actividad 4
app.get('/api/alumnos', (req, res) => {
  res.json(alumnos);
});

app.post('/api/alumnos', (req, res) => {
  const { nombre, carrera } = req.body;
  const newAlumno = { id: nextAlumnoId++, nombre, carrera };
  alumnos.push(newAlumno);
  res.json(newAlumno);
});

app.listen(PORT, () => {
  console.log(`Servidor principal corriendo en http://localhost:${PORT}`);
});
