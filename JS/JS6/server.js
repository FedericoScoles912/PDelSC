/**
 * @file server.js
 * @description Entry point del servidor Node.js para el juego El Ahorcado.
 *   Expone API REST para gestión de scores, health check y sirve archivos estáticos.
 *   Usa Express, mysql2/promise con pool de conexiones, cors y dotenv.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/**
 * Pool de conexiones MySQL.
 * Configurado con variables de entorno exclusivamente.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Middleware de logging de requests.
 * Registra método, ruta, status code y tiempo de respuesta.
 * Usa colores ANSI cuando el entorno lo soporta.
 */
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    const elapsed = Date.now() - start;
    const method = req.method.padEnd(6, ' ');
    const status = res.statusCode;
    const color =
      status >= 500
        ? '\x1b[31m'
        : status >= 400
        ? '\x1b[33m'
        : status >= 300
        ? '\x1b[36m'
        : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(
      `${color}${method}${reset} ${req.originalUrl} ${color}${status}${reset} - ${elapsed}ms`
    );
    return originalSend(body);
  };
  next();
});

/**
 * @api {get} /api/health Health Check
 * @apiName GetHealth
 * @apiGroup System
 * @apiDescription Endpoint de salud para verificar que el servidor está corriendo.
 *
 * @apiSuccess {Object} response Respuesta estándar
 * @apiSuccess {String} response.status Estado del servidor
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *     "status": "ok"
 *   }
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @api {get} /api/scores Obtener Scores
 * @apiName GetScores
 * @apiGroup Scores
 * @apiDescription Devuelve los 20 mejores scores ordenados por puntos descendentes y tiempo ascendente.
 *
 * @apiSuccess {Object[]} scores                   Lista de puntuaciones
 * @apiSuccess {Number}   scores.id                ID único del score
 * @apiSuccess {String}   scores.nombre            Nombre del jugador
 * @apiSuccess {Number}   scores.puntos            Puntuación obtenida
 * @apiSuccess {Number}   scores.tiempo            Tiempo en segundos
 * @apiSuccess {String}   scores.fecha             Fecha y hora de la partida (ISO)
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   [{
 *     "id": 1,
 *     "nombre": "Juan",
 *     "puntos": 150,
 *     "tiempo": 45,
 *     "fecha": "2024-01-15T10:30:00.000Z"
 *   }]
 */
app.get('/api/scores', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, puntos, tiempo, fecha
       FROM score
       ORDER BY puntos DESC, tiempo ASC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {post} /api/scores Guardar Score
 * @apiName PostScore
 * @apiGroup Scores
 * @apiDescription Inserta un nuevo score en la base de datos.
 *
 * @apiParam {String} nombre  Nombre del jugador (obligatorio)
 * @apiParam {Number} puntos  Puntuación obtenida (número positivo)
 * @apiParam {Number} tiempo  Tiempo en segundos (número positivo)
 *
 * @apiParamExample {json} Request-Example:
 *   {
 *     "nombre": "María",
 *     "puntos": 120,
 *     "tiempo": 60
 *   }
 *
 * @apiSuccess {Object} score                    Score guardado
 * @apiSuccess {Number} score.id                 ID generado
 * @apiSuccess {String} score.nombre             Nombre del jugador
 * @apiSuccess {Number} score.puntos             Puntuación
 * @apiSuccess {Number} score.tiempo             Tiempo en segundos
 * @apiSuccess {String} score.fecha              Fecha de creación (ISO)
 *
 * @apiError {Boolean} error    true
 * @apiError {String}  message  Descripción del error
 */
app.post('/api/scores', async (req, res, next) => {
  try {
    const { nombre, puntos, tiempo } = req.body || {};

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({
        error: true,
        message: 'El campo "nombre" es obligatorio y no puede estar vacío.',
      });
    }

    if (puntos === undefined || puntos === null || typeof puntos !== 'number' || puntos < 0) {
      return res.status(400).json({
        error: true,
        message: 'El campo "puntos" debe ser un número positivo o cero.',
      });
    }

    if (tiempo === undefined || tiempo === null || typeof tiempo !== 'number' || tiempo < 0) {
      return res.status(400).json({
        error: true,
        message: 'El campo "tiempo" debe ser un número positivo.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO score (nombre, puntos, tiempo) VALUES (?, ?, ?)`,
      [nombre.trim().slice(0, 60), puntos, tiempo]
    );

    const [rows] = await pool.query(
      `SELECT id, nombre, puntos, tiempo, fecha FROM score WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * Middleware global de manejo de errores.
 * Devuelve siempre JSON estructurado con la forma { error: true, message }.
 */
app.use((err, _req, res, _next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', err);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Ocurrió un error interno en el servidor.',
  });
});

app.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', `╔══════════════════════════════════════════════╗`);
  console.log('\x1b[32m%s\x1b[0m', `║   El Ahorcado - Palabras al Límite          ║`);
  console.log('\x1b[32m%s\x1b[0m', `║   Servidor corriendo en http://localhost:${PORT} ║`);
  console.log('\x1b[32m%s\x1b[0m', `╚══════════════════════════════════════════════╝`);
});
