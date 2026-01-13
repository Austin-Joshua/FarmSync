import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePictureHandler,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  logoutAllDevices,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadProfilePicture } from '../middleware/upload';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/picture', authenticate, uploadProfilePicture.single('picture'), uploadProfilePictureHandler);
router.get('/sessions', authenticate, getActiveSessions);
router.post('/logout-all', authenticate, logoutAllDevices);

export default router;
