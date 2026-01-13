import { Router } from 'express';
import {
  getSummaryReport,
  getCustomReport,
} from '../controllers/reportsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummaryReport);
router.get('/custom', getCustomReport);

export default router;
