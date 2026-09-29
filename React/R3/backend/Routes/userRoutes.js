import { Router } from 'express';
import { getMe, updateMe, changePassword } from '../Controllers/userController.js';
import { requireAuth } from '../Middlewares/authMiddleware.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.patch('/me', requireAuth, updateMe);
router.post('/change-password', requireAuth, changePassword);

export default router;
