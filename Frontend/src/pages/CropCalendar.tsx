import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Check, X, Sprout, Droplets, Bug, Droplet, Package } from 'lucide-react';
import api from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Crop } from '../types';

interface CalendarEvent {
  id: string;
  crop_id?: string;
  event_type: 'planting' | 'harvest' | 'fertilizer' | 'pesticide' | 'irrigation' | 'other';
  title: string;
  description?: string;
  event_date: string;
  reminder_days: number;
  is_completed: boolean;
}

const CropCalendar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_type: 'planting' as CalendarEvent['event_type'],
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    reminder_days: 7,
  });

  useEffect(() => {
    loadEvents();
    loadCrops();
  }, [currentDate, user]);

  const loadEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const response = await api.getCalendarEvents(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      if (response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCrops = async () => {
    if (!user) return;
    try {
      const response = await api.getCrops();
      if (response.data) {
        // Transform backend crop data to frontend format
        const transformedCrops = response.data.map((crop: any) => ({
          id: crop.id,
          name: crop.name,
          season: crop.season || '',
          sowingDate: crop.sowing_date ? format(new Date(crop.sowing_date), 'yyyy-MM-dd') : '',
          harvestDate: crop.harvest_date ? format(new Date(crop.harvest_date), 'yyyy-MM-dd') : '',
          status: crop.status,
          farmId: crop.farm_id,
        }));
        setCrops(transformedCrops);
      }
    } catch (error) {
      console.error('Failed to load crops:', error);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.createCalendarEvent(newEvent);
      await loadEvents();
      setShowAddModal(false);
      setNewEvent({
        event_type: 'planting',
        title: '',
        description: '',
        event_date: format(new Date(), 'yyyy-MM-dd'),
        reminder_days: 7,
      });
    } catch (error: any) {
      alert(error?.message || 'Failed to create event');
    }
  };

  const handleToggleComplete = async (event: CalendarEvent) => {
    try {
      await api.updateCalendarEvent(event.id, { is_completed: !event.is_completed });
      await loadEvents();
    } catch (error: any) {
      alert(error?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.deleteCalendarEvent(id);
      await loadEvents();
      setShowEventModal(false);
    } catch (error: any) {
      alert(error?.message || 'Failed to delete event');
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.event_date), date));
  };

  const getCropDatesForDate = (date: Date): { sowing: Crop[]; harvest: Crop[] } => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const sowingCrops = crops.filter(crop => crop.sowingDate === dateStr);
    const harvestCrops = crops.filter(crop => crop.harvestDate === dateStr);
    return { sowing: sowingCrops, harvest: harvestCrops };
  };

  const getEventIcon = (type: CalendarEvent['event_type']) => {
    const icons = {
      planting: Sprout,
      harvest: Package,
      fertilizer: Droplets,
      pesticide: Bug,
      irrigation: Droplet,
      other: Calendar,
    };
    return icons[type] || Calendar;
  };

  const getEventColor = (type: CalendarEvent['event_type']) => {
    const colors = {
      planting: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      harvest: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      fertilizer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      pesticide: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      irrigation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[type] || colors.other;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Crop Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your farming schedule and activities</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2">
              {day}
            </div>
          ))}

          {/* Empty days at start */}
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 border border-gray-200 dark:border-gray-700 rounded-lg"></div>
          ))}

          {/* Calendar Days */}
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);
            const cropDates = getCropDatesForDate(day);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const hasFarmingActivity = cropDates.sowing.length > 0 || cropDates.harvest.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={`h-24 border rounded-lg p-1 overflow-y-auto ${
                  isCurrentDay
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : hasFarmingActivity
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedEvent(dayEvents[0]);
                    setShowEventModal(true);
                  }
                }}
              >
                <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {/* Show farming dates (sowing/harvest) */}
                  {cropDates.sowing.map((crop) => (
                    <div
                      key={`sowing-${crop.id}`}
                      className="text-xs px-1 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-pointer"
                      title={`Sowing: ${crop.name}`}
                    >
                      <div className="flex items-center gap-1">
                        <Sprout size={10} />
                        <span className="truncate">Sow: {crop.name}</span>
                      </div>
                    </div>
                  ))}
                  {cropDates.harvest.map((crop) => (
                    <div
                      key={`harvest-${crop.id}`}
                      className="text-xs px-1 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 cursor-pointer"
                      title={`Harvest: ${crop.name}`}
                    >
                      <div className="flex items-center gap-1">
                        <Package size={10} />
                        <span className="truncate">Harvest: {crop.name}</span>
                      </div>
                    </div>
                  ))}
                  {/* Show calendar events */}
                  {dayEvents.slice(0, 2).map((event) => {
                    const Icon = getEventIcon(event.event_type);
                    return (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded ${getEventColor(event.event_type)} ${
                          event.is_completed ? 'line-through opacity-60' : ''
                        } cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Icon size={10} />
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(dayEvents.length > 2 || (cropDates.sowing.length + cropDates.harvest.length) > 0) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      +{dayEvents.length - 2 + cropDates.sowing.length + cropDates.harvest.length} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(['planting', 'harvest', 'fertilizer', 'pesticide', 'irrigation', 'other'] as const).map((type) => {
            const Icon = getEventIcon(type);
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`p-2 rounded ${getEventColor(type)}`}>
                  <Icon size={16} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Close modal"
                aria-label="Close event details modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <p className="text-gray-900 dark:text-gray-100">{selectedEvent.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const Icon = getEventIcon(selectedEvent.event_type);
                    return (
                      <div className={`flex items-center gap-2 px-2 py-1 rounded ${getEventColor(selectedEvent.event_type)}`}>
                        <Icon size={16} />
                        <span className="capitalize">{selectedEvent.event_type}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {format(new Date(selectedEvent.event_date), 'MMMM d, yyyy')}
                </p>
              </div>
              {selectedEvent.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedEvent.description}</p>
                </div>
              )}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleToggleComplete(selectedEvent)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedEvent.is_completed
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Check size={16} />
                  {selectedEvent.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Calendar Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Close modal"
                aria-label="Close add event modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  id="event_type"
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as CalendarEvent['event_type'] })}
                  className="w-full input-field"
                >
                  <option value="planting">Planting</option>
                  <option value="harvest">Harvest</option>
                  <option value="fertilizer">Fertilizer Application</option>
                  <option value="pesticide">Pesticide Application</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="event_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  id="event_title"
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full input-field"
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Date *
                </label>
                <input
                  id="event_date"
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="w-full input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full input-field"
                  rows={3}
                  placeholder="Enter event description (optional)"
                />
              </div>
              <div>
                <label htmlFor="reminder_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder Days Before Event
                </label>
                <input
                  id="reminder_days"
                  type="number"
                  value={newEvent.reminder_days}
                  onChange={(e) => setNewEvent({ ...newEvent, reminder_days: parseInt(e.target.value) || 7 })}
                  className="w-full input-field"
                  min="0"
                  max="365"
                  placeholder="7"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleAddEvent}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Event
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCalendar;
