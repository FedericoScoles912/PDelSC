const http = require('http');
const path = require('path');
const url = require('url');
const { MENU_ITEMS } = require('./modules/menu');
const { getRoute } = require('./modules/routes');
const { serveStatic } = require('./modules/file-service');
const { createPageRenderer } = require('./modules/page-renderer');

const INITIAL_PORT = Number(process.env.PORT) || 8080;
const MAX_PORT_ATTEMPTS = 10;
const pagesDir = path.join(__dirname, 'pages');
const articlesDir = path.join(pagesDir, 'articles');
const stylesDir = path.join(__dirname, 'styles');
const { renderPage } = createPageRenderer({ pagesDir, articlesDir });
let currentPort = INITIAL_PORT;
let portAttempts = 0;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname || '/';
    const host = req.headers.host || 'localhost';

    console.log(`[REQ] host=${host} path=${pathname} query=${JSON.stringify(parsedUrl.query)}`);

    if (pathname === '/styles/styles.css') {
        serveStatic(res, path.join(stylesDir, 'styles.css'), 'text/css; charset=utf-8');
        return;
    }

    if (!getRoute(pathname) && pathname !== '/') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
    }

    try {
        const html = await renderPage(pathname);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } catch (error) {
        console.error('Error al renderizar la pagina:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
    }
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && portAttempts < MAX_PORT_ATTEMPTS) {
        portAttempts += 1;
        currentPort += 1;
        console.warn(`Puerto ocupado. Reintentando en http://localhost:${currentPort}`);
        server.listen(currentPort);
        return;
    }

    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
});

server.on('listening', () => {
    console.log(`Servidor ejecutandose en http://localhost:${currentPort}`);
    console.log(`Secciones activas: ${MENU_ITEMS.map((item) => item.label).join(', ')}`);
});

server.listen(currentPort);
