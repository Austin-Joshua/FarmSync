import { Router } from 'express';
import {
  getFertilizers,
  createFertilizer,
  updateFertilizer,
  deleteFertilizer,
  fertilizerValidation,
} from '../controllers/fertilizerController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getFertilizers);
router.post('/', validate(fertilizerValidation), createFertilizer);
router.put('/:id', updateFertilizer);
router.delete('/:id', deleteFertilizer);

export default router;
