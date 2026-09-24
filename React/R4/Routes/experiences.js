import express from 'express';
import pool from '../Database/connection.js';

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

export default router;
