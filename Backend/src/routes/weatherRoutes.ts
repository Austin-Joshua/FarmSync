import { Router } from 'express';
import {
  getCurrentWeather,
  getClimateAlerts,
  getCurrentLocation,
  getWeatherByCity,
} from '../controllers/weatherController';
import { authenticate } from '../middleware/auth';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

// Public route - Get weather by city name (no auth required)
router.get(
  '/',
  [
    query('city')
      .trim()
      .notEmpty()
      .withMessage('City name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('City name must be between 2 and 100 characters'),
  ],
  validate(query('city')),
  getWeatherByCity
);

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
