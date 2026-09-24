import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import skillsRouter from './Routes/skills.js';
import projectsRouter from './Routes/projects.js';
import experiencesRouter from './Routes/experiences.js';
import achievementsRouter from './Routes/achievements.js';
import messagesRouter from './Routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

app.use(express.json());
app.use(cors());
app.use(express.static(distPath));

app.use('/api/skills', skillsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/experiences', experiencesRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/messages', messagesRouter);

app.get('*', (req, res, next) => {
  if (fs.existsSync(indexHtmlPath)) {
    res.sendFile(indexHtmlPath);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
