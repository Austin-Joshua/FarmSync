import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CropCalendarModel } from '../models/CropCalendar';
import { AppError } from '../middleware/errorHandler';
import { body } from 'express-validator';

/**
 * GET /api/calendar/events
 * Get calendar events for current user
 */
export const getCalendarEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const events = await CropCalendarModel.findByUserId(req.user.id, startDate, endDate);

    res.json({
      message: 'Calendar events retrieved successfully',
      data: events,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * GET /api/calendar/upcoming
 * Get upcoming events (next 30 days by default)
 */
export const getUpcomingEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const events = await CropCalendarModel.findUpcomingEvents(req.user.id, days);

    res.json({
      message: 'Upcoming events retrieved successfully',
      data: events,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * POST /api/calendar/events
 * Create a new calendar event
 */
export const createCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { crop_id, event_type, title, description, event_date, reminder_days } = req.body;

    if (!event_type || !title || !event_date) {
      throw new AppError('Event type, title, and date are required', 400);
    }

    const event = await CropCalendarModel.create({
      user_id: req.user.id,
      crop_id,
      event_type,
      title,
      description,
      event_date: new Date(event_date),
      reminder_days: reminder_days || 7,
    });

    res.status(201).json({
      message: 'Calendar event created successfully',
      data: event,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * PUT /api/calendar/events/:id
 * Update a calendar event
 */
export const updateCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const event = await CropCalendarModel.findById(id);

    if (!event) {
      throw new AppError('Calendar event not found', 404);
    }

    if (event.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    const updates: any = {};
    if (req.body.crop_id !== undefined) updates.crop_id = req.body.crop_id;
    if (req.body.event_type) updates.event_type = req.body.event_type;
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.event_date) updates.event_date = new Date(req.body.event_date);
    if (req.body.reminder_days !== undefined) updates.reminder_days = req.body.reminder_days;
    if (req.body.is_completed !== undefined) updates.is_completed = req.body.is_completed;

    const updatedEvent = await CropCalendarModel.update(id, updates);

    res.json({
      message: 'Calendar event updated successfully',
      data: updatedEvent,
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

/**
 * DELETE /api/calendar/events/:id
 * Delete a calendar event
 */
export const deleteCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const event = await CropCalendarModel.findById(id);

    if (!event) {
      throw new AppError('Calendar event not found', 404);
    }

    if (event.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized access', 403);
    }

    await CropCalendarModel.delete(id);

    res.json({
      message: 'Calendar event deleted successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode || 500);
  }
};

export const calendarEventValidation = [
  body('event_type').isIn(['planting', 'harvest', 'fertilizer', 'pesticide', 'irrigation', 'other']).withMessage('Valid event type is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('event_date').isISO8601().withMessage('Valid event date is required'),
  body('reminder_days').optional().isInt({ min: 0, max: 365 }).withMessage('Reminder days must be between 0 and 365'),
];
