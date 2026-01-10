import { Router } from 'express';
import {
  getCropRecommendation,
  getRecommendationHistory,
  getModelInfo,
  recommendationValidation,
} from '../controllers/mlController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post('/recommend', validate(recommendationValidation), getCropRecommendation);
router.get('/history', getRecommendationHistory);
router.get('/model-info', getModelInfo);

export default router;
