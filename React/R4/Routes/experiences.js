import express from 'express';
import pool from '../Database/connection.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

// Obtener todas las experiencias ordenadas por fecha de inicio descendente
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM experiences ORDER BY start_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener experiencias:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { company, role, start_date, end_date = null, location = null, description = '' } = req.body;
  const result = await pool.query('INSERT INTO experiences (company, role, start_date, end_date, location, description) VALUES (?,?,?,?,?,?)', [company, role, start_date, end_date || null, location, description]);
  const created = await pool.query('SELECT * FROM experiences WHERE id = ?', [result.insertId]);
  res.status(201).json(created.rows[0]);
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { company, role, start_date, end_date = null, location = null, description = '' } = req.body;
  await pool.query('UPDATE experiences SET company=?, role=?, start_date=?, end_date=?, location=?, description=? WHERE id=?', [company, role, start_date, end_date || null, location, description, req.params.id]);
  const result = await pool.query('SELECT * FROM experiences WHERE id = ?', [req.params.id]);
  res.json(result.rows[0]);
});
router.delete('/:id', requireAdmin, async (req, res) => { await pool.query('DELETE FROM experiences WHERE id=?', [req.params.id]); res.status(204).end(); });

export default router;
