import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  appleLogin,
  microsoftLogin,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
  googleLoginValidation,
  appleLoginValidation,
  microsoftLoginValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/google', validate(googleLoginValidation), googleLogin);
router.post('/apple', validate(appleLoginValidation), appleLogin);
router.post('/microsoft', validate(microsoftLoginValidation), microsoftLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
