import fs from 'fs';
import path from 'path';

export const readFileUtf8 = (filePath) => fs.promises.readFile(filePath, 'utf8');

export const getRandomFileFromDir = async (dirPath) => {
    const files = await fs.promises.readdir(dirPath);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    const randomIndex = Math.floor(Math.random() * htmlFiles.length);
    return htmlFiles[randomIndex];
};

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
