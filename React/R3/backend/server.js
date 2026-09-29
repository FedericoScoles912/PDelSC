import express from 'express';
import cookieParser from 'cookie-parser';
import env from './Config/env.js';
import corsMiddleware from './Middlewares/corsMiddleware.js';
import errorMiddleware from './Middlewares/errorMiddleware.js';
import authRoutes from './Routes/authRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import { optionalAuth } from './Middlewares/authMiddleware.js';

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(optionalAuth);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), env: env.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('*', (req, res) => {
  res.status(404).json({ ok: false, error: 'Endpoint no encontrado' });
});

app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`🚀 Auth backend corriendo en http://localhost:${env.port} [${env.nodeEnv}]`);
});

export default app;
