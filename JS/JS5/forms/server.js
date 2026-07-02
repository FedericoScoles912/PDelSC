import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'alumnosDB'
};

let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    await pool.getConnection();
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'pages')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));

async function getAllAlumnos() {
  const [rows] = await pool.execute('SELECT * FROM alumnos ORDER BY apellido ASC');
  return rows;
}

async function getAlumnoById(id) {
  const [rows] = await pool.execute('SELECT * FROM alumnos WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createAlumno(nombre, apellido, edad) {
  const [result] = await pool.execute(
    'INSERT INTO alumnos (nombre, apellido, edad) VALUES (?, ?, ?)',
    [nombre, apellido, edad]
  );
  return { id: result.insertId, nombre, apellido, edad };
}

async function updateAlumno(id, nombre, apellido, edad) {
  await pool.execute(
    'UPDATE alumnos SET nombre = ?, apellido = ?, edad = ? WHERE id = ?',
    [nombre, apellido, edad, id]
  );
  return { id, nombre, apellido, edad };
}

async function deleteAlumno(id) {
  await pool.execute('DELETE FROM alumnos WHERE id = ?', [id]);
}

function validateNombreApellido(value, fieldName) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return { valid: false, message: `${fieldName} es requerido` };
  }
  if (value.length > 100) {
    return { valid: false, message: `${fieldName} no puede exceder 100 caracteres`, field: fieldName.toLowerCase() };
  }
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!regex.test(value)) {
    return { valid: false, message: `${fieldName} solo puede contener letras y espacios`, field: fieldName.toLowerCase() };
  }
  return { valid: true };
}

function validateEdad(value) {
  if (value === undefined || value === null) {
    return { valid: false, message: 'Edad es requerida', field: 'edad' };
  }
  const edad = Number(value);
  if (isNaN(edad) || !Number.isInteger(edad)) {
    return { valid: false, message: 'Edad debe ser un número entero', field: 'edad' };
  }
  if (edad < 1 || edad > 120) {
    return { valid: false, message: 'Edad debe estar entre 1 y 120', field: 'edad' };
  }
  return { valid: true };
}

app.get('/api/alumnos', async (req, res) => {
  try {
    const alumnos = await getAllAlumnos();
    res.json({ success: true, data: alumnos, total: alumnos.length });
  } catch (error) {
    console.error('Error en GET /api/alumnos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.get('/api/alumnos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alumno = await getAlumnoById(id);
    if (!alumno) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }
    res.json({ success: true, data: alumno });
  } catch (error) {
    console.error('Error en GET /api/alumnos/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/alumnos', async (req, res) => {
  try {
    const { nombre, apellido, edad } = req.body;

    const nombreValidation = validateNombreApellido(nombre, 'Nombre');
    if (!nombreValidation.valid) {
      return res.status(400).json({ success: false, message: nombreValidation.message, field: nombreValidation.field });
    }

    const apellidoValidation = validateNombreApellido(apellido, 'Apellido');
    if (!apellidoValidation.valid) {
      return res.status(400).json({ success: false, message: apellidoValidation.message, field: apellidoValidation.field });
    }

    const edadValidation = validateEdad(edad);
    if (!edadValidation.valid) {
      return res.status(400).json({ success: false, message: edadValidation.message, field: edadValidation.field });
    }

    const nuevoAlumno = await createAlumno(nombre.trim(), apellido.trim(), edad);
    res.status(201).json({ success: true, data: nuevoAlumno });
  } catch (error) {
    console.error('Error en POST /api/alumnos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.put('/api/alumnos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, edad } = req.body;

    const alumnoExistente = await getAlumnoById(id);
    if (!alumnoExistente) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }

    const nombreValidation = validateNombreApellido(nombre, 'Nombre');
    if (!nombreValidation.valid) {
      return res.status(400).json({ success: false, message: nombreValidation.message, field: nombreValidation.field });
    }

    const apellidoValidation = validateNombreApellido(apellido, 'Apellido');
    if (!apellidoValidation.valid) {
      return res.status(400).json({ success: false, message: apellidoValidation.message, field: apellidoValidation.field });
    }

    const edadValidation = validateEdad(edad);
    if (!edadValidation.valid) {
      return res.status(400).json({ success: false, message: edadValidation.message, field: edadValidation.field });
    }

    const alumnoActualizado = await updateAlumno(id, nombre.trim(), apellido.trim(), edad);
    res.json({ success: true, data: alumnoActualizado });
  } catch (error) {
    console.error('Error en PUT /api/alumnos/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.delete('/api/alumnos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const alumnoExistente = await getAlumnoById(id);
    if (!alumnoExistente) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }

    await deleteAlumno(id);
    res.json({ success: true, message: 'Alumno eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/alumnos/:id:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Servidor de forms corriendo en http://localhost:${PORT}`);
  });
}

startServer();
