import express from 'express';
import pool from '../Database/connection.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

// Obtener todos los proyectos ordenados por destacado y id descendente
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY featured DESC, id DESC'
    );
    res.json(result.rows.map((project) => ({ ...project, tags: typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags })));
  } catch (err) {
    console.error('Error al obtener proyectos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un proyecto por su id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    const project = result.rows[0];
    res.json({ ...project, tags: typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags });
  } catch (err) {
    console.error('Error al obtener proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, description, repo_url = null, demo_url = null, image_url = null, tags = [], featured = false } = req.body;
  const result = await pool.query('INSERT INTO projects (title, description, repo_url, demo_url, image_url, tags, featured) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, description, repo_url, demo_url, image_url, JSON.stringify(tags), featured]);
  const created = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
  res.status(201).json(created.rows[0]);
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { title, description, repo_url = null, demo_url = null, image_url = null, tags = [], featured = false } = req.body;
  await pool.query('UPDATE projects SET title=?, description=?, repo_url=?, demo_url=?, image_url=?, tags=?, featured=? WHERE id=?', [title, description, repo_url, demo_url, image_url, JSON.stringify(tags), featured, req.params.id]);
  const result = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  res.json(result.rows[0]);
});
router.delete('/:id', requireAdmin, async (req, res) => { await pool.query('DELETE FROM projects WHERE id=?', [req.params.id]); res.status(204).end(); });

export default router;
