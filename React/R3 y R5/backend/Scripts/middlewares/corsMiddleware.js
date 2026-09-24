import cors from 'cors';
import env from '../config/env.js';

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      env.frontendUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || env.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['X-Request-Id'],
};

export default cors(corsOptions);
