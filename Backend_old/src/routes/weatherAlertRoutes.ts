import { Router } from 'express';
import {
  getWeatherAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
} from '../controllers/weatherAlertController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/alerts', getWeatherAlerts);
router.get('/alerts/unread', getUnreadAlerts);
router.post('/alerts/:id/read', markAlertAsRead);
router.post('/alerts/read-all', markAllAlertsAsRead);

export default router;
