// Importar el framework Express para crear el servidor web
import express from 'express';
// Importar el módulo path para manejar rutas de archivos
import path from 'path';
// Importar fileURLToPath para convertir URL de archivo a ruta de sistema
import { fileURLToPath } from 'url';

// Obtener la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear una instancia de la aplicación Express
const app = express();
// Definir el puerto del servidor (usar variable de entorno o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos desde el directorio actual
app.use(express.static(__dirname));

// Ruta principal: servir la página index.html de la carpeta Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Pages', 'index.html'));
});

// Iniciar el servidor y escuchar en el puerto definido
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
