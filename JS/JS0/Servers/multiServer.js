// Importar el framework Express para crear servidores web
import express from 'express';
// Importar el módulo path para manejar rutas de archivos
import path from 'path';
// Importar fileURLToPath para convertir URL de archivo a ruta de sistema
import { fileURLToPath } from 'url';

/**
 * Función para crear un servidor Express independiente
 * @param {number} port - Puerto en el que escuchará el servidor
 * @param {string} moduleName - Nombre del módulo para identificarlo en los logs
 */
const createServer = (port, moduleName) => {
    // Obtener la ruta del archivo actual y su directorio
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Obtener la ruta del directorio raíz del proyecto
    const rootDir = path.join(__dirname, '..');

    // Crear una instancia de la aplicación Express
    const app = express();
    
    // Middleware para servir archivos estáticos desde el directorio raíz
    app.use(express.static(rootDir));

    // Ruta principal: servir la página index.html de la carpeta Pages
    app.get('/', (req, res) => {
        res.sendFile(path.join(rootDir, 'Pages', 'index.html'));
    });

    // Iniciar el servidor y escuchar en el puerto definido
    app.listen(port, () => {
        console.log(`[${moduleName}] Servidor independiente en http://localhost:${port}`);
    });
};

// Configuración de módulos con sus puertos asignados
const modules = [
    { name: 'PushPop', port: 3001 },
    { name: 'ShiftUnshift', port: 3002 },
    { name: 'SpliceSlice', port: 3003 },
    { name: 'SearchMethods', port: 3004 },
    { name: 'IterationMethods', port: 3005 },
    { name: 'TransformMethods', port: 3006 }
];

// Obtener el argumento pasado por línea de comandos (si existe)
const targetModule = process.argv[2];

if (targetModule) {
    // Si se pasó un argumento, buscar el módulo correspondiente
    const mod = modules.find(m => m.name.toLowerCase() === targetModule.toLowerCase());
    if (mod) {
        // Si se encontró el módulo, crear su servidor
        createServer(mod.port, mod.name);
    } else {
        // Si no se encontró, mostrar un mensaje de error
        console.error(`Módulo ${targetModule} no encontrado.`);
    }
} else {
    // Si no se pasó ningún argumento, crear servidores para todos los módulos
    modules.forEach(mod => createServer(mod.port, mod.name));
}
