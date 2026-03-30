import { Router } from 'express';
import {
  getFields,
  getFieldsByFarm,
  createField,
  updateField,
  deleteField,
  fieldValidation,
} from '../controllers/fieldController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getFields);
router.get('/farm/:farmId', getFieldsByFarm);
router.post('/', validate(fieldValidation), createField);
router.put('/:id', updateField);
router.delete('/:id', deleteField);

export default router;
