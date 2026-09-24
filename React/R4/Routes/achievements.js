import express from 'express';
import pool from '../Database/connection.js';

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

export default router;
