/**
 * auth.routes.js
 */
import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { authRequired } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import * as ctrl from '../controllers/authController.js';
import {
  registerSchema, loginSchema, socialSchema, refreshSchema, changePasswordSchema,
} from '../validators/authSchemas.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), ctrl.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), ctrl.login);
router.post('/social/:proveedor', authLimiter, validate({ body: socialSchema.omit({ proveedor: true }) }), (req, res, next) => {
  req.body.proveedor = req.params.proveedor;
  next();
}, ctrl.social);
router.post('/refresh', validate({ body: refreshSchema }), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authRequired, ctrl.me);
router.patch('/password', authRequired, validate({ body: changePasswordSchema }), ctrl.changePassword);

export default router;
