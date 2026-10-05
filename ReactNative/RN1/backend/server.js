import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { testDbConnection } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares
app.use(cors({
  origin: '*', // Permitir peticiones desde Expo Web y dispositivos móviles
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);

// Endpoint directo auxiliar /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    status: 'UP',
    servicio: 'API de Acceso de Usuarios',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Manejador global de errores
app.use(errorHandler);

// Inicializar el servidor y comprobar base de datos
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`  Servidor Backend ejecutándose en: http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    POST http://localhost:${PORT}/api/auth/login`);
  console.log(`    GET  http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);

  await testDbConnection();
});

export default app;
