import { Router } from 'express';
import { getUserStatus } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/user/status - Get user status including onboarding status
router.get('/status', getUserStatus);

export default router;
