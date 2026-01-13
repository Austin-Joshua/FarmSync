import { CropCalendarModel } from '../models/CropCalendar';
import { CropModel } from '../models/Crop';
import { UserModel } from '../models/User';

export class CalendarService {
  /**
   * Auto-generate calendar events from crops
   * Creates planting, harvest, and maintenance reminders based on crop data
   */
  static async generateEventsFromCrops(userId: string): Promise<void> {
    try {
      // Get all active crops for user
      const crops = await CropModel.findByFarmerId(userId);
      const activeCrops = crops.filter(c => c.status === 'active' || c.status === 'planned');

      for (const crop of activeCrops) {
        // Planting event (if sowing_date is in future)
        if (crop.sowing_date && new Date(crop.sowing_date) > new Date()) {
          await CropCalendarModel.create({
            user_id: userId,
            crop_id: crop.id,
            event_type: 'planting',
            title: `Plant ${crop.name}`,
            description: `Sowing date for ${crop.name}`,
            event_date: new Date(crop.sowing_date),
            reminder_days: 7,
          }).catch(() => {
            // Ignore duplicates
          });
        }

        // Harvest event (if harvest_date exists)
        if (crop.harvest_date) {
          await CropCalendarModel.create({
            user_id: userId,
            crop_id: crop.id,
            event_type: 'harvest',
            title: `Harvest ${crop.name}`,
            description: `Expected harvest date for ${crop.name}`,
            event_date: new Date(crop.harvest_date),
            reminder_days: 14, // Remind 2 weeks before harvest
          }).catch(() => {
            // Ignore duplicates
          });

          // Calculate mid-growth fertilizer application (halfway between planting and harvest)
          if (crop.sowing_date && crop.harvest_date) {
            const sowingDate = new Date(crop.sowing_date);
            const harvestDate = new Date(crop.harvest_date);
            const midDate = new Date((sowingDate.getTime() + harvestDate.getTime()) / 2);

            if (midDate > new Date()) {
              await CropCalendarModel.create({
                user_id: userId,
                crop_id: crop.id,
                event_type: 'fertilizer',
                title: `Fertilize ${crop.name}`,
                description: `Mid-growth fertilizer application for ${crop.name}`,
                event_date: midDate,
                reminder_days: 3,
              }).catch(() => {
                // Ignore duplicates
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating calendar events from crops:', error);
      // Don't throw - this is a background service
    }
  }

  /**
   * Get calendar summary for dashboard
   */
  static async getCalendarSummary(userId: string): Promise<{
    upcomingEvents: number;
    todayEvents: number;
    thisWeekEvents: number;
    nextWeekEvents: number;
  }> {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(today.getDate() + 14);

    const upcoming = await CropCalendarModel.findUpcomingEvents(userId, 14);
    const todayEvents = upcoming.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate.toDateString() === today.toDateString();
    });
    const thisWeekEvents = upcoming.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate >= today && eventDate <= endOfWeek;
    });
    const nextWeekEvents = upcoming.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate > endOfWeek && eventDate <= endOfNextWeek;
    });

    return {
      upcomingEvents: upcoming.length,
      todayEvents: todayEvents.length,
      thisWeekEvents: thisWeekEvents.length,
      nextWeekEvents: nextWeekEvents.length,
    };
  }
}
