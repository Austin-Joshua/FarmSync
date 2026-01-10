import { Router } from 'express';
import {
  getPesticides,
  createPesticide,
  updatePesticide,
  deletePesticide,
  pesticideValidation,
} from '../controllers/pesticideController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getPesticides);
router.post('/', validate(pesticideValidation), createPesticide);
router.put('/:id', updatePesticide);
router.delete('/:id', deletePesticide);

export default router;
