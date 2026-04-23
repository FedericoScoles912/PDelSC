import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projects = [
    { name: 'Dashboard', dir: '.', script: 'server.js' },
    { name: 'Lab 1', dir: 'lab1', script: 'server.js' },
    { name: 'Lab 2', dir: 'lab2', script: 'server.js' },
    { name: 'Lab 3', dir: 'lab3', script: 'server.js' },
    { name: 'Lab 4', dir: 'lab4', script: 'server.js' },
    { name: 'Lab 5', dir: 'lab5', script: 'server.js' },
    { name: 'Lab 6', dir: 'lab6', script: 'server.js' }
];

projects.forEach(proj => {
    // Iniciar cada proceso de servidor de forma independiente
    const child = spawn('node', [proj.script], {
        cwd: path.join(__dirname, proj.dir),
        shell: true
    });

    // Capturar y mostrar la salida estándar
    child.stdout.on('data', (data) => {
        console.log(`[${proj.name}] ${data}`);
    });

    // Capturar y mostrar errores
    child.stderr.on('data', (data) => {
        console.error(`[${proj.name}] Error: ${data}`);
    });

    // Registrar cuando un servidor se detiene
    child.on('close', (code) => {
        console.log(`[${proj.name}] finalizado con código ${code}`);
    });
});
