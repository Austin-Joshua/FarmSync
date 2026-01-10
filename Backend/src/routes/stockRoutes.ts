import { Router } from 'express';
import {
  getStockItems,
  getStockItem,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  getMonthlyStockUsage,
  createMonthlyStockUsage,
  stockValidation,
} from '../controllers/stockController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getStockItems);
router.get('/:id', getStockItem);
router.post('/', validate(stockValidation), createStockItem);
router.put('/:id', updateStockItem);
router.delete('/:id', deleteStockItem);

// Monthly Stock Usage History
router.get('/history/monthly', getMonthlyStockUsage);
router.post('/history/monthly', createMonthlyStockUsage);

export default router;
