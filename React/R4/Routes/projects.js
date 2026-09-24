import express from 'express';
import pool from '../Database/connection.js';

const router = express.Router();

// Obtener todos los proyectos ordenados por destacado y id descendente
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY featured DESC, id DESC'
    );
    res.json(result.rows);
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
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener proyecto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
