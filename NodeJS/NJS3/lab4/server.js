import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/misterioso.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'misterioso.html')));
app.listen(PORT, () => console.log(`Lab 4 Server running on http://localhost:${PORT}`));
