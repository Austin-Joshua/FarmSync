import { Router } from 'express';
import { getAdminStatistics } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get comprehensive admin statistics
router.get('/statistics', getAdminStatistics);

export default router;
