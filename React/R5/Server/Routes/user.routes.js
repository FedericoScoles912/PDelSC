import { Router } from 'express';
import { getProfile, updateProfile } from '../Controllers/user.controller.js';
import {
  updateProfileRules,
  handleValidation,
} from '../Middlewares/validateBody.middleware.js';
import { requireAuth } from '../Middlewares/auth.middleware.js';

// Montado en /api  ->  /api/profile
const router = Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfileRules, handleValidation, updateProfile);

export default router;
