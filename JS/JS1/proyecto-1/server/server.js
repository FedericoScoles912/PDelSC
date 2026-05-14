import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(rootDir));

/**
 * Genera un timestamp para el nombre del archivo (YYYYMMDD_HHmmss)
 */
const getTimestamp = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

/**
 * Endpoint para guardar los números en un TXT
 */
app.post('/guardar', async (req, res) => {
    const { numeros } = req.body;

    if (!numeros || !Array.isArray(numeros)) {
        return res.status(400).json({ ok: false, error: 'Datos inválidos' });
    }

    try {
        const timestamp = getTimestamp();
        const fileName = `numeros_${timestamp}.txt`;
        const filePath = path.join(rootDir, 'output', fileName);

        // Contenido: un número por línea
        const content = numeros.join('\n');

        // Asegurar que la carpeta output existe
        await fs.mkdir(path.join(rootDir, 'output'), { recursive: true });
        
        await fs.writeFile(filePath, content, 'utf8');

        res.json({ ok: true, archivo: fileName });
    } catch (error) {
        console.error('Error al guardar archivo:', error);
        res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor Proyecto 1 corriendo en http://localhost:${PORT}`);
});
