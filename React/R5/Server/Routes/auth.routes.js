import { Router } from 'express';
import { register, login, logout } from '../Controllers/auth.controller.js';
import {
  registerRules,
  loginRules,
  handleValidation,
} from '../Middlewares/validateBody.middleware.js';
import { authLimiter } from '../Middlewares/rateLimit.middleware.js';
import { requireAuth } from '../Middlewares/auth.middleware.js';

// Montado en /api  ->  /api/register, /api/login, /api/logout
const router = Router();

router.post('/register', authLimiter, registerRules, handleValidation, register);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/logout', requireAuth, logout);

export default router;
