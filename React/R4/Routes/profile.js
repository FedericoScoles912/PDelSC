import express from 'express';
import pool from '../Database/connection.js';
import { requireAdmin } from './auth.js';

const router = express.Router();
const columns = ['full_name', 'role', 'tagline', 'email', 'phone', 'city', 'github_url', 'linkedin_url', 'profile_image_url', 'about_paragraphs', 'languages', 'hobbies'];

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profile WHERE id = 1');
    const profile = result.rows[0] || {};
    for (const field of ['about_paragraphs', 'languages', 'hobbies']) {
      if (typeof profile[field] === 'string') profile[field] = JSON.parse(profile[field]);
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el perfil.' });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const values = columns.map((column) => {
      const value = req.body[column] ?? (column.includes('paragraphs') || ['languages', 'hobbies'].includes(column) ? [] : '');
      return ['about_paragraphs', 'languages', 'hobbies'].includes(column) ? JSON.stringify(value) : value;
    });
    const placeholders = columns.map((column) => `${column} = ?`).join(', ');
    await pool.query(`UPDATE profile SET ${placeholders}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`, values);
    const result = await pool.query('SELECT * FROM profile WHERE id = 1');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo actualizar el perfil.' });
  }
});

export default router;
