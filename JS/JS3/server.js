import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3004;
const ARCHIVO_PUNTUACIONES = path.join(__dirname, 'puntuaciones.json');

app.use(express.json());
// Disable caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});
app.use(express.static(__dirname, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Servir páginas HTML desde la carpeta pages
app.get('/*.html', (req, res) => {
  const fileName = req.path;
  res.sendFile(path.join(__dirname, 'pages', fileName));
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
                console.error('Error reading scores file:', error);
            }
        }
        
        // Add new score and sort all scores (not just top 3 initially)
        puntuaciones.push(nuevaPuntuacion);
        puntuaciones.sort((a, b) => {
            if (b.puntaje !== a.puntaje) {
                return b.puntaje - a.puntaje;
            }
            return a.tiempo - b.tiempo;
        });
        
        // Keep all scores, not just top 3
        await fs.writeFile(ARCHIVO_PUNTUACIONES, JSON.stringify(puntuaciones, null, 2));
        res.json(puntuaciones);
    } catch (error) {
        console.error('Error al guardar puntuación:', error);
        res.status(500).json({ error: 'Error al guardar puntuación' });
    }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
