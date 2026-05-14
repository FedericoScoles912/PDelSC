import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = 3001; // Puerto diferente para no entrar en conflicto con P1

// Configuración de Multer
const upload = multer({ dest: 'uploads/' });

app.use(express.static(rootDir));
app.use(express.json());

/**
 * Funciones de procesamiento (Lógica de negocio)
 */
const getFactorialN = (num) => {
    if (num < 1) return null;
    let fact = 1;
    for (let i = 0; i <= 12; i++) {
        if (i > 1) fact *= i;
        if (fact === num) return i;
        if (fact > num) break;
    }
    return null;
};

const checkFiltro = (num) => {
    const valorAbsoluto = Math.abs(num);
    // Un número es de un solo dígito si su valor absoluto es menor o igual a 9
    // Esto descarta (0, 1, 2, ..., 9) y (-1, -2, ..., -9)
    if (valorAbsoluto <= 9) return false;
    
    const s = valorAbsoluto.toString();
    return s[0] === s[s.length - 1];
};

/**
 * Endpoint para procesar el archivo
 */
app.post('/procesar', upload.single('archivo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    try {
        const content = await fs.readFile(req.file.path, 'utf8');
        const lines = content.split('\n').map(l => l.trim()).filter(l => l !== "");
        
        const todosLosNumeros = lines.map(l => parseInt(l)).filter(n => !isNaN(n));
        
        if (todosLosNumeros.length === 0) {
            throw new Error("El archivo no contiene números válidos.");
        }

        const utiles = todosLosNumeros.filter(checkFiltro);
        const descartadosList = todosLosNumeros.filter(n => !checkFiltro(n));
        const porcentaje = ((utiles.length / todosLosNumeros.length) * 100).toFixed(2);

        // Ordenar ascendente
        const filtradosOrdenados = [...utiles].sort((a, b) => a - b);
        const descartadosOrdenados = [...descartadosList].sort((a, b) => a - b);

        // Detectar factoriales en TODOS los números (válidos y descartados)
        const factoriales = todosLosNumeros
            .map(num => ({ num, n: getFactorialN(num) }))
            .filter(f => f.n !== null)
            .sort((a, b) => a.num - b.num); // Ordenar por el número factorial

        // Eliminar duplicados si los hay en la lista de factoriales
        const factorialesUnicos = Array.from(new Set(factoriales.map(f => f.num)))
            .map(num => factoriales.find(f => f.num === num));

        // Guardar resultado en TXT
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const nombreResultado = `resultado_${timestamp}.txt`;
        const pathResultado = path.join(rootDir, 'output', nombreResultado);
        const downloadsPath = path.join(os.homedir(), 'Downloads', nombreResultado);

        const txtContent = `=== RESULTADO DEL FILTRADO ===
Fecha: ${new Date().toLocaleString()}
Archivo fuente: ${req.file.originalname}

--- ESTADÍSTICAS ---
Total de números: ${todosLosNumeros.length}
Números útiles (cumplen filtro): ${utiles.length}
Números descartados: ${descartadosList.length}
Porcentaje útil: ${porcentaje}%

--- NÚMEROS FILTRADOS (ascendente) ---
${filtradosOrdenados.join('\n')}

--- NÚMEROS DESCARTADOS (ascendente) ---
${descartadosOrdenados.join('\n')}

--- NÚMEROS FACTORIALES (Detectados en todo el archivo) ---
${factorialesUnicos.map(f => `${f.num} = ${f.n}!`).join('\n')}`;

        await fs.mkdir(path.join(rootDir, 'output'), { recursive: true });
        
        // Guardar en el directorio del proyecto
        await fs.writeFile(pathResultado, txtContent, 'utf8');

        // Guardar también en la carpeta de Descargas del sistema
        try {
            await fs.writeFile(downloadsPath, txtContent, 'utf8');
        } catch (downloadErr) {
            console.error('No se pudo guardar en Descargas:', downloadErr);
        }

        // Limpiar archivo temporal
        await fs.unlink(req.file.path);

        res.json({
            total: todosLosNumeros.length,
            utiles: utiles.length,
            descartados: descartadosList.length,
            numerosDescartados: descartadosOrdenados,
            porcentaje,
            numerosFiltrados: filtradosOrdenados,
            factoriales: factorialesUnicos,
            archivoResultado: nombreResultado
        });

    } catch (error) {
        console.error(error);
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint para descargar archivos de output
 */
app.get('/descargar/:archivo', async (req, res) => {
    const fileName = req.params.archivo;
    const filePath = path.join(rootDir, 'output', fileName);
    
    try {
        await fs.access(filePath);
        res.download(filePath);
    } catch (err) {
        res.status(404).json({ error: 'Archivo no encontrado' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Proyecto 2 corriendo en http://localhost:${PORT}`);
});
