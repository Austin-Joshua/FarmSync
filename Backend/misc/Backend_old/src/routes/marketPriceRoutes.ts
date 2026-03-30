import { Router } from 'express';
import {
  getCurrentPrice,
  getPriceHistory,
  getBestTimeToSell,
  setPriceAlert,
} from '../controllers/marketPriceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:crop', getCurrentPrice);
router.get('/:crop/history', getPriceHistory);
router.get('/:crop/best-time', getBestTimeToSell);
router.post('/:crop/alert', setPriceAlert);

export default router;
