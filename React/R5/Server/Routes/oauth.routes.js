import { Router } from 'express';

import {
  startOAuthFlow,
  startLinkFlow,
  oauthCallback,
  exchangeTempCode,
  getLinkedAccounts,
  unlinkProvider,
} from '../Controllers/oauth.controller.js';
import { validateProvider } from '../Middlewares/validateProvider.middleware.js';
import { validateOAuthState } from '../Middlewares/oauthState.middleware.js';
import { requireAuth } from '../Middlewares/auth.middleware.js';
import { authLimiter } from '../Middlewares/rateLimit.middleware.js';
import { exchangeRules, handleValidation } from '../Middlewares/validateBody.middleware.js';

// Montado en /api/auth
const router = Router();

// --- Rutas literales primero (para que no las capture /:provider) ----
router.get('/linked-accounts', requireAuth, getLinkedAccounts);
router.post('/exchange', authLimiter, exchangeRules, handleValidation, exchangeTempCode);
router.post('/link/:provider', requireAuth, validateProvider, startLinkFlow);
router.delete('/link/:provider', requireAuth, validateProvider, unlinkProvider);

// --- Flujo OAuth ------------------------------------------------------
router.get('/:provider', authLimiter, validateProvider, startOAuthFlow);
router.get('/:provider/callback', validateProvider, validateOAuthState, oauthCallback);

export default router;
