import { Router } from 'express';
import {
  getCrops,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
  getCropTypes,
  createCropType,
  updateCropType,
  deleteCropType,
  cropValidation,
  cropTypeValidation,
} from '../controllers/cropController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Crop Types (Master Data - Admin only)
router.get('/types', getCropTypes);
router.post('/types', authenticate, requireAdmin, validate(cropTypeValidation), createCropType);
router.put('/types/:id', authenticate, requireAdmin, updateCropType);
router.delete('/types/:id', authenticate, requireAdmin, deleteCropType);

// Crops
router.use(authenticate);

router.get('/', getCrops);
router.get('/:id', getCrop);
router.post('/', validate(cropValidation), createCrop);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

export default router;
