import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

dotenv.config();

// --- Configuración y Conexión MySQL ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'auth_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- Constantes de Entorno ---
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-super-seguro-cambiar-en-produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// --- Servidor Express ---
const app = express();

// Middlewares globales
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Helpers de Sanitización y Validación ---
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- Middleware de Autenticación JWT ---
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: 'Token no proporcionado o formato inválido (debe ser Bearer <token>)',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, error: 'La sesión ha expirado, inicia sesión nuevamente' });
    }
    return res.status(401).json({ ok: false, error: 'Token inválido o manipulado' });
  }
}

// --- Rutas de la API REST ---

/**
 * GET /api/health
 * Verificación de estado del servidor y conexión MySQL
 */
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() as current_time');
    res.json({
      ok: true,
      service: 'user-auth-system-api',
      time: rows[0].current_time,
      dbStatus: 'connected',
      dbEngine: 'MySQL 8.0',
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      service: 'user-auth-system-api',
      dbStatus: 'disconnected',
      dbEngine: 'MySQL 8.0',
      error: error.message,
    });
  }
});

/**
 * POST /api/register
 * Registro de nuevo usuario (name, email, password)
 */
app.post('/api/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    // Validaciones
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ ok: false, error: 'El nombre debe tener al menos 2 caracteres' });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, error: 'El correo electrónico no es válido' });
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Comprobar si el email ya existe
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ ok: false, error: 'El correo electrónico ya está registrado' });
    }

    // Hashear contraseña con bcrypt
    const passwordHash = await bcrypt.hash(cleanPassword, BCRYPT_ROUNDS);
    const userId = crypto.randomUUID();

    // Inserción en la base de datos MySQL
    await pool.query(
      `INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`,
      [userId, cleanName, cleanEmail, passwordHash]
    );

    // Obtener usuario creado
    const [userRows] = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    const newUser = userRows[0];

    // Firmar token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado exitosamente',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/login
 * Inicio de sesión (email, password)
 */
app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ ok: false, error: 'Debe ingresar email y contraseña' });
    }

    // Buscar usuario por email en MySQL
    const [rows] = await pool.query(
      'SELECT id, name, email, password, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Comparar contraseña hasheada
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    // Firmar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      ok: true,
      message: 'Inicio de sesión exitoso',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile
 * Obtener perfil del usuario autenticado (Ruta protegida)
 */
app.get('/api/profile', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      user: sanitizeUser(rows[0]),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/profile
 * Actualizar datos del perfil (name, email, password opcional) (Ruta protegida)
 */
app.put('/api/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ ok: false, error: 'El nombre debe tener al menos 2 caracteres' });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, error: 'El correo electrónico no es válido' });
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    const [emailCheck] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [cleanEmail, req.user.id]
    );
    if (emailCheck.length > 0) {
      return res.status(409).json({ ok: false, error: 'El correo electrónico ya está en uso por otra cuenta' });
    }

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await pool.query(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
        [cleanName, cleanEmail, newHash, req.user.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [cleanName, cleanEmail, req.user.id]
      );
    }

    const [updatedRows] = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      user: sanitizeUser(updatedRows[0]),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/logout
 * Cierre de sesión (informa al cliente que descarte el token de localStorage)
 */
app.post('/api/logout', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Sesión cerrada exitosamente',
  });
});

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error('[Error API]', err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Error interno del servidor',
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend Express (MySQL) corriendo en http://localhost:${PORT}`);
});

export default app;
