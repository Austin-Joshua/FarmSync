import { Router } from 'express';
import {
  sendWhatsAppMessage,
  verifyWebhook,
  receiveWebhook,
} from '../controllers/whatsappController';

const router = Router();

router.get('/webhook', verifyWebhook);
router.post('/webhook', receiveWebhook);
router.post('/send', sendWhatsAppMessage);

export default router;
