import express from 'express';
import pool from '../Database/connection.js';

const router = express.Router();

const emailRegex = /\S+@\S+\.\S+/;

// Crear un nuevo mensaje con validación
router.post('/', async (req, res) => {
  try {
    const { name, email, body } = req.body;
    const errors = [];

    // Validar nombre no vacío
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push('El nombre es obligatorio y no puede estar vacío');
    }

    // Validar email con regex
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      errors.push('El correo electrónico es inválido');
    }

    // Validar body no vacío
    if (!body || typeof body !== 'string' || body.trim() === '') {
      errors.push('El mensaje es obligatorio y no puede estar vacío');
    }

    // Si hay errores de validación, devolver 400
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Insertar mensaje en la base de datos
    const result = await pool.query(
      'INSERT INTO messages (name, email, body) VALUES ($1, $2, $3) RETURNING id',
      [name.trim(), email.trim(), body.trim()]
    );

    res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error al crear mensaje:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
