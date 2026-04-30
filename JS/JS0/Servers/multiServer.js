import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const createServer = (port, moduleName) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.join(__dirname, '..');

    const app = express();
    
    app.use(express.static(rootDir));

    app.get('/', (req, res) => {
        res.sendFile(path.join(rootDir, 'Pages', 'index.html'));
    });

    app.listen(port, () => {
        console.log(`[${moduleName}] Servidor independiente en http://localhost:${port}`);
    });
};

// Puertos asignados a cada "proyecto/módulo"
const modules = [
    { name: 'PushPop', port: 3001 },
    { name: 'ShiftUnshift', port: 3002 },
    { name: 'SpliceSlice', port: 3003 },
    { name: 'SearchMethods', port: 3004 },
    { name: 'IterationMethods', port: 3005 },
    { name: 'TransformMethods', port: 3006 }
];

// Si se pasa un argumento, arranca solo ese. Si no, arranca todos (para desarrollo)
const targetModule = process.argv[2];

if (targetModule) {
    const mod = modules.find(m => m.name.toLowerCase() === targetModule.toLowerCase());
    if (mod) {
        createServer(mod.port, mod.name);
    } else {
        console.error(`Módulo ${targetModule} no encontrado.`);
    }
} else {
    // Por defecto, arrancamos todos en sus respectivos puertos
    modules.forEach(mod => createServer(mod.port, mod.name));
}
