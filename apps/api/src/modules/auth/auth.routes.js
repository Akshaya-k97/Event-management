import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please slow down.' },
});

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(register));
router.post('/login',    authLimiter, validate(loginSchema),    asyncHandler(login));
router.post('/refresh',  asyncHandler(refresh));
router.post('/logout',   asyncHandler(logout));
router.get('/me',        requireAuth, asyncHandler(me));

export default router;