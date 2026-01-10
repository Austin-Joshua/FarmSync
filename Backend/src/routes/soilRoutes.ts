import { Router } from 'express';
import { getSoilTypes } from '../controllers/soilController';

const router = Router();

router.get('/', getSoilTypes);

export default router;
