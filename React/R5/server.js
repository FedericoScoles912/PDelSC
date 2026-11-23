import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { env } from './Server/Config/env.js';
import { verifyDbConnection } from './Server/Config/db.js';
import { configurePassport } from './Server/Config/passport.js';
import { enabledProviderIds } from './Server/Config/providers.js';
import authRoutes from './Server/Routes/auth.routes.js';
import userRoutes from './Server/Routes/user.routes.js';
import oauthRoutes from './Server/Routes/oauth.routes.js';
import { notFound, errorHandler } from './Server/Middlewares/error.middleware.js';

const app = express();

// Passport queda configurado solo con los proveedores que tienen credenciales.
const { passport, registered } = configurePassport();

// --- Seguridad y parsers base -----------------------------------------
app.use(helmet());
// CORS restringido al origen exacto del frontend.
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
// Sin sesiones: el flujo OAuth usa session:false y JWT propio.
app.use(passport.initialize());

// --- Raíz e índice de la API + Health check (no dependen de la BBDD) --
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-auth-system',
    message: 'API REST de user-auth-system en ejecución.',
    env: env.nodeEnv,
    frontendUrl: env.frontendUrl,
    oauthProviders: enabledProviderIds(),
    endpoints: {
      health: '/api/health',
      login: 'POST /api/login',
      register: 'POST /api/register',
      me: 'GET /api/me',
      profile: 'PUT /api/profile',
      oauth: 'GET /api/auth/:provider',
      linkedAccounts: 'GET /api/auth/linked-accounts',
    },
  });
});

// --- Rutas de la API ---------------------------------------------------
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/auth', oauthRoutes);

// --- 404 y manejador central de errores (siempre al final) ------------
app.use(notFound);
app.use(errorHandler);

// --- Arranque ----------------------------------------------------------
async function start() {
  const dbReady = await verifyDbConnection();
  if (!dbReady) {
    console.warn(
      '[server] El servidor arranca pero la base de datos no responde. ' +
        'Verificá las variables DB_* en .env y que MySQL esté corriendo.'
    );
  } else {
    console.log('[db] Conexión a MySQL establecida.');
  }

  app.listen(env.port, () => {
    console.log(`[server] API escuchando en ${env.backendUrl} (puerto ${env.port})`);
  });
}

start();

export default app;
