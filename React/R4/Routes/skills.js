import express from 'express';
import pool from '../Database/connection.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

// Obtener todas las habilidades ordenadas por categoría y nombre
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM skills ORDER BY category, name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener habilidades:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, category, level = 0, icon_name = 'code' } = req.body;
  const result = await pool.query('INSERT INTO skills (name, category, level, icon_name) VALUES (?, ?, ?, ?)', [name, category, level, icon_name]);
  const created = await pool.query('SELECT * FROM skills WHERE id = ?', [result.insertId]);
  res.status(201).json(created.rows[0]);
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, category, level = 0, icon_name = 'code' } = req.body;
  await pool.query('UPDATE skills SET name = ?, category = ?, level = ?, icon_name = ? WHERE id = ?', [name, category, level, icon_name, req.params.id]);
  const result = await pool.query('SELECT * FROM skills WHERE id = ?', [req.params.id]);
  res.json(result.rows[0]);
});
router.delete('/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

export default router;
