const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.static(path.join(__dirname, '.')));

const alumnos = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', curso: 'Ingeniería de Software' },
  { id: 2, nombre: 'María Gómez', email: 'maria@example.com', curso: 'Ciencia de Datos' },
  { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', curso: 'Diseño UI/UX' },
  { id: 4, nombre: 'Ana Ruiz', email: 'ana@example.com', curso: 'Desarrollo Web' },
  { id: 5, nombre: 'Diego Martín', email: 'diego@example.com', curso: 'Inteligencia Artificial' },
  { id: 6, nombre: 'Laura Sánchez', email: 'laura@example.com', curso: 'Ciberseguridad' }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/alumnos', (req, res) => {
  res.json(alumnos);
});

app.listen(PORT, () => {
  console.log(`Servidor de Actividad 4 corriendo en http://localhost:${PORT}`);
});