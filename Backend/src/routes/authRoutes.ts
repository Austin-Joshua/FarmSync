import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePictureHandler,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadProfilePicture } from '../middleware/upload';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/picture', authenticate, uploadProfilePicture.single('picture'), uploadProfilePictureHandler);

export default router;
