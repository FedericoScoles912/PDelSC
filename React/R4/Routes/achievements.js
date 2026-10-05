import express from 'express';
import pool from '../Database/connection.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

// Obtener todos los logros ordenados por fecha de obtención descendente
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM achievements ORDER BY date_earned DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener logros:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, issuer, date_earned, description = '', certificate_url = null } = req.body;
  const result = await pool.query('INSERT INTO achievements (title, issuer, date_earned, description, certificate_url) VALUES (?,?,?,?,?)', [title, issuer, date_earned, description, certificate_url]);
  const created = await pool.query('SELECT * FROM achievements WHERE id = ?', [result.insertId]);
  res.status(201).json(created.rows[0]);
});
router.put('/:id', requireAdmin, async (req, res) => {
  const { title, issuer, date_earned, description = '', certificate_url = null } = req.body;
  await pool.query('UPDATE achievements SET title=?, issuer=?, date_earned=?, description=?, certificate_url=? WHERE id=?', [title, issuer, date_earned, description, certificate_url, req.params.id]);
  const result = await pool.query('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
  res.json(result.rows[0]);
});
router.delete('/:id', requireAdmin, async (req, res) => { await pool.query('DELETE FROM achievements WHERE id=?', [req.params.id]); res.status(204).end(); });

export default router;
