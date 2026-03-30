import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface CropCalendarEvent {
  id: string;
  user_id: string;
  crop_id?: string;
  event_type: 'planting' | 'harvest' | 'fertilizer' | 'pesticide' | 'irrigation' | 'other';
  title: string;
  description?: string;
  event_date: Date;
  reminder_days: number;
  is_completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCalendarEventData {
  user_id: string;
  crop_id?: string;
  event_type: 'planting' | 'harvest' | 'fertilizer' | 'pesticide' | 'irrigation' | 'other';
  title: string;
  description?: string;
  event_date: Date;
  reminder_days?: number;
}

export class CropCalendarModel {
  static async findByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<CropCalendarEvent[]> {
    let sql = 'SELECT * FROM crop_calendar_events WHERE user_id = ?';
    const params: any[] = [userId];

    if (startDate && endDate) {
      sql += ' AND event_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      sql += ' AND event_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      sql += ' AND event_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY event_date ASC, event_type ASC';

    return query<CropCalendarEvent>(pool, sql, params);
  }

  static async findUpcomingEvents(userId: string, days: number = 30): Promise<CropCalendarEvent[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return query<CropCalendarEvent>(
      pool,
      `SELECT * FROM crop_calendar_events 
       WHERE user_id = ? 
       AND event_date >= ? 
       AND event_date <= ?
       AND is_completed = FALSE
       ORDER BY event_date ASC`,
      [userId, today, futureDate]
    );
  }

  static async findById(id: string): Promise<CropCalendarEvent | null> {
    return queryOne<CropCalendarEvent>(pool, 'SELECT * FROM crop_calendar_events WHERE id = ?', [id]);
  }

  static async create(data: CreateCalendarEventData): Promise<CropCalendarEvent> {
    await execute(
      pool,
      `INSERT INTO crop_calendar_events (user_id, crop_id, event_type, title, description, event_date, reminder_days)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.crop_id || null,
        data.event_type,
        data.title,
        data.description || null,
        data.event_date,
        data.reminder_days || 7,
      ]
    );

    const event = await queryOne<CropCalendarEvent>(
      pool,
      'SELECT * FROM crop_calendar_events WHERE user_id = ? AND title = ? AND event_date = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.title, data.event_date]
    );
    if (!event) throw new Error('Failed to create calendar event');
    return event;
  }

  static async update(id: string, updates: Partial<CreateCalendarEventData & { is_completed?: boolean }>): Promise<CropCalendarEvent> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.crop_id !== undefined) {
      fields.push(`crop_id = ?`);
      values.push(updates.crop_id);
    }
    if (updates.event_type) {
      fields.push(`event_type = ?`);
      values.push(updates.event_type);
    }
    if (updates.title) {
      fields.push(`title = ?`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = ?`);
      values.push(updates.description);
    }
    if (updates.event_date) {
      fields.push(`event_date = ?`);
      values.push(updates.event_date);
    }
    if (updates.reminder_days !== undefined) {
      fields.push(`reminder_days = ?`);
      values.push(updates.reminder_days);
    }
    if (updates.is_completed !== undefined) {
      fields.push(`is_completed = ?`);
      values.push(updates.is_completed);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await execute(
      pool,
      `UPDATE crop_calendar_events SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const event = await queryOne<CropCalendarEvent>(pool, 'SELECT * FROM crop_calendar_events WHERE id = ?', [id]);
    if (!event) throw new Error('Calendar event not found');
    return event;
  }

  static async delete(id: string): Promise<void> {
    await execute(pool, 'DELETE FROM crop_calendar_events WHERE id = ?', [id]);
  }

  static async getEventsForReminder(userId: string): Promise<CropCalendarEvent[]> {
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() + 7); // Default reminder 7 days before

    return query<CropCalendarEvent>(
      pool,
      `SELECT * FROM crop_calendar_events 
       WHERE user_id = ? 
       AND event_date BETWEEN ? AND ?
       AND is_completed = FALSE
       ORDER BY event_date ASC`,
      [userId, today, reminderDate]
    );
  }
}
