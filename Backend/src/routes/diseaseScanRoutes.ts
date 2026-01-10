import { Router } from 'express';
import {
  createDiseaseScan,
  getDiseaseScans,
  getDiseaseHeatmap,
  getDiseaseStats,
  diseaseScanValidation,
} from '../controllers/diseaseScanController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate); // All routes require authentication

router.post('/scan', validate(diseaseScanValidation), createDiseaseScan);
router.get('/scans', getDiseaseScans);
router.get('/heatmap', getDiseaseHeatmap);
router.get('/stats', getDiseaseStats);

export default router;
