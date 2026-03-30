import { Router } from 'express';
import {
  getMonthlyIncome,
  createOrUpdateMonthlyIncome,
  monthlyIncomeValidation,
} from '../controllers/historyController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/income/monthly', getMonthlyIncome);
router.post('/income/monthly', validate(monthlyIncomeValidation), createOrUpdateMonthlyIncome);

export default router;
