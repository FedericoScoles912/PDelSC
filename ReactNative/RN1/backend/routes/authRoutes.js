import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateLogin } from '../middlewares/validateLogin.js';

const router = Router();

// Endpoint de autenticación
router.post('/login', validateLogin, AuthController.login);

// Endpoint auxiliar de verificación de salud
router.get('/health', AuthController.health);

export default router;
