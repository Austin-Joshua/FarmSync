import { Router } from 'express';
import {
  getCalendarEvents,
  getUpcomingEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  calendarEventValidation,
} from '../controllers/calendarController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/events', getCalendarEvents);
router.get('/upcoming', getUpcomingEvents);
router.post('/events', validate(calendarEventValidation), createCalendarEvent);
router.put('/events/:id', updateCalendarEvent);
router.delete('/events/:id', deleteCalendarEvent);

export default router;
