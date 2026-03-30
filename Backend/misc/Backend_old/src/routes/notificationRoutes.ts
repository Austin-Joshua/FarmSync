import { Router } from 'express';
import {
  subscribePushNotification,
  unsubscribePushNotification,
  sendTestEmail,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Push notification routes
router.post(
  '/push/subscribe',
  validate([
    body('endpoint').notEmpty().withMessage('Endpoint is required'),
    body('keys.p256dh').notEmpty().withMessage('p256dh key is required'),
    body('keys.auth').notEmpty().withMessage('auth key is required'),
  ]),
  subscribePushNotification
);

router.delete('/push/unsubscribe', unsubscribePushNotification);

// Email notification routes
router.post('/email/test', sendTestEmail);

export default router;
