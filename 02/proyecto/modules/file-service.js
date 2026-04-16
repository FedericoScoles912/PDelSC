import fs from 'fs';

export const readFileUtf8 = (filePath) => fs.promises.readFile(filePath, 'utf8');

export const serveStatic = (res, filePath, contentType) => {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
};
