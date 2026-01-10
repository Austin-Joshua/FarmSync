import { Router } from 'express';
import {
  getIrrigations,
  createIrrigation,
  updateIrrigation,
  deleteIrrigation,
  irrigationValidation,
} from '../controllers/irrigationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getIrrigations);
router.post('/', validate(irrigationValidation), createIrrigation);
router.put('/:id', updateIrrigation);
router.delete('/:id', deleteIrrigation);

export default router;
