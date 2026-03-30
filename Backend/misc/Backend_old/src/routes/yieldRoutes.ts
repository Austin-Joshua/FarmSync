import { Router } from 'express';
import {
  getYields,
  getYield,
  createYield,
  updateYield,
  deleteYield,
  yieldValidation,
} from '../controllers/yieldController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getYields);
router.get('/:id', getYield);
router.post('/', validate(yieldValidation), createYield);
router.put('/:id', updateYield);
router.delete('/:id', deleteYield);

export default router;
