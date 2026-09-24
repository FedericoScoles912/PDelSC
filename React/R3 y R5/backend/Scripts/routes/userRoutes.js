import { Router } from 'express';
import { getMe, updateMe, changePassword } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.post('/change-password', requireAuth, changePassword);

export default router;
