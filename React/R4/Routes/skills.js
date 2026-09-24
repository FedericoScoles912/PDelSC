import express from 'express';
import pool from '../Database/connection.js';

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

export default router;
