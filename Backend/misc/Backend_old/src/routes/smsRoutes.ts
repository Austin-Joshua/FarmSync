import { Router } from 'express';
import {
  sendSMS,
  sendTestSMS,
} from '../controllers/smsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/send', sendSMS);
router.post('/test', sendTestSMS);

export default router;
