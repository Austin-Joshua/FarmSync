import { Router } from 'express';
import {
  getCurrentWeather,
  getClimateAlerts,
  getCurrentLocation,
} from '../controllers/weatherController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

const locationValidation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

router.post('/current', validate(locationValidation), getCurrentWeather);
router.post('/alerts', validate(locationValidation), getClimateAlerts);
router.post('/location/current', validate(locationValidation), getCurrentLocation);

export default router;
