import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ejercicio1Content } from './Scripts/ejercicios1.js';
import { ejercicio2Content } from './Scripts/ejercicios2.js';
import { ejercicio3Content } from './Scripts/ejercicios3.js';
import { ejercicio4Content } from './Scripts/ejercicios4.js';
import { ejercicio5Operaciones } from './Scripts/ejercicios5.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/ejercicio/:id', (req, res) => {
  const id = req.params.id;
  let content;
  let title = `Ejercicio ${id}`;

  if (id === '1') {
    content = ejercicio1Content.map(line => `<p class="card-text fs-5">${line}</p>`).join('');
  } else if (id === '2') {
    content = ejercicio2Content.map(line => `<p class="card-text fs-5">${line}</p>`).join('');
  } else if (id === '3') {
    content = ejercicio3Content.map(line => `<p class="card-text fs-5">${line}</p>`).join('');
  } else if (id === '4') {
    content = ejercicio4Content.map(line => `<p class="card-text fs-5">${line}</p>`).join('');
  } else if (id === '5') {
    content = `
      <h2 class="card-title text-center mb-4">Ejercicio 5 - Tabla de Resultados</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Operación</th>
            <th>Valores</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          ${ejercicio5Operaciones.map(op => `
            <tr>
              <td>${op.Operación}</td>
              <td>${op.Valores}</td>
              <td class="fw-bold">${op.Resultado}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    content = '<p>Ejercicio no encontrado</p>';
  }

  // Read the base ejercicio HTML to use as a template
  const templatePath = path.join(__dirname, 'public', 'ejercicio1.html');
  fs.readFile(templatePath, 'utf8', (err, html) => {
    if (err) {
      res.status(500).send('Error');
      return;
    }

    // Replace the title and content in the template
    const finalHtml = html
      .replace(/<title>Ejercicio .*<\/title>/, `<title>${title}</title>`)
      .replace(
        /<div class="card-body text-center">[\s\S]*?<\/div>/,
        `<div class="card-body ${id === '5' ? '' : 'text-center'}">${content}</div>`
      );
    
    res.send(finalHtml);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
