import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3004;
const ARCHIVO_PUNTUACIONES = path.join(__dirname, 'puntuaciones.txt');

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.get('/api/puntuaciones', async (req, res) => {
  try {
    const contenido = await fs.readFile(ARCHIVO_PUNTUACIONES, 'utf-8');
    const puntuaciones = contenido.trim() ? JSON.parse(contenido) : [];
    res.json(puntuaciones);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json([]);
    } else {
      res.status(500).json({ error: 'Error al leer puntuaciones' });
    }
  }
});

app.post('/api/puntuaciones', async (req, res) => {
  try {
    const nuevaPuntuacion = req.body;
    let puntuaciones = [];
    
    try {
      const contenido = await fs.readFile(ARCHIVO_PUNTUACIONES, 'utf-8');
      puntuaciones = contenido.trim() ? JSON.parse(contenido) : [];
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    puntuaciones.push(nuevaPuntuacion);
    puntuaciones.sort((a, b) => {
      if (b.puntaje !== a.puntaje) {
        return b.puntaje - a.puntaje;
      }
      return a.tiempo - b.tiempo;
    });
    
    const top3 = puntuaciones.slice(0, 3);
    await fs.writeFile(ARCHIVO_PUNTUACIONES, JSON.stringify(top3, null, 2));
    res.json(top3);
  } catch (error) {
    console.error('Error al guardar puntuación:', error);
    res.status(500).json({ error: 'Error al guardar puntuación' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
