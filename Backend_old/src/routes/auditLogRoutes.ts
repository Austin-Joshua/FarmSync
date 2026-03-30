import { Router } from 'express';
import {
  getAllAuditLogs,
  getMyAuditLogs,
  getLoginHistory,
  getActivitySummary,
} from '../controllers/auditLogController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get audit logs for current user
router.get('/me', getMyAuditLogs);

// Admin-only routes
router.get('/', requireAdmin, getAllAuditLogs);
router.get('/login-history', requireAdmin, getLoginHistory);
router.get('/activity-summary', requireAdmin, getActivitySummary);

export default router;
