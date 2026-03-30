import { Router } from 'express';
import {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
  farmValidation,
} from '../controllers/farmController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getFarms);
router.get('/:id', getFarm);
router.post('/', validate(farmValidation), createFarm);
router.put('/:id', updateFarm);
router.delete('/:id', deleteFarm);

export default router;
