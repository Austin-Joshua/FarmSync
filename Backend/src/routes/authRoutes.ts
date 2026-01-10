import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
  googleLoginValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/google', validate(googleLoginValidation), googleLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
