import { Router } from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  expenseValidation,
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getExpenses);
router.get('/:id', getExpense);
router.post('/', validate(expenseValidation), createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
