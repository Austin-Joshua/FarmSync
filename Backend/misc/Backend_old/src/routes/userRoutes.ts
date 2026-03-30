import { Router } from 'express';
import { getUserStatus, getUserProfile, getDatabaseStatus } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/user/status - Get user status including onboarding status
router.get('/status', getUserStatus);

// GET /api/user/profile - Get user profile with database connectivity status
router.get('/profile', getUserProfile);

// GET /api/user/db-status - Get database connectivity status
router.get('/db-status', getDatabaseStatus);

export default router;
