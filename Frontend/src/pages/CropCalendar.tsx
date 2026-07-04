import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Check, X, Sprout, Droplets, Bug, Droplet, Package, Loader, Save } from 'lucide-react';
import api from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Crop } from '../types';
import toast from 'react-hot-toast';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    event_type: 'planting' as CalendarEvent['event_type'],
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    reminder_days: 7,
  });

  useEffect(() => {
    loadData();
  }, [currentDate, user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const [eventsRes, cropsRes] = await Promise.all([
        api.getCalendarEvents(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')),
        api.getCrops()
      ]);

      setEvents(eventsRes.data || []);
      setCrops(cropsRes.data || []);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast.error('Failed to load calendar events');
    } finally {
      // Data load complete
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.event_date) {
      toast.error('Title and date are required');
      return;
    }

    setSaving(true);
    try {
      await api.createCalendarEvent(newEvent);
      toast.success('Event added to calendar');
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (event: CalendarEvent) => {
    try {
      await api.updateCalendarEvent(event.id, { is_completed: !event.is_completed });
      toast.success(event.is_completed ? 'Event marked as pending' : 'Activity completed!');
      loadData();
      if (showEventModal) setShowEventModal(false);
    } catch (error: any) {
      toast.error('Failed to update event status');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Remove this event from your calendar?')) return;
    try {
      await api.deleteCalendarEvent(id);
      toast.success('Event deleted');
      setShowEventModal(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setNewEvent({
      event_type: 'planting',
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      reminder_days: 7,
    });
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
      other: CalendarIcon,
    };
    return icons[type] || CalendarIcon;
  };

  const getEventColor = (type: CalendarEvent['event_type']) => {
    const colors = {
      planting: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
      harvest: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
      fertilizer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
      pesticide: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
      irrigation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200',
      other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200',
    };
    return colors[type] || colors.other;
  };

  const daysInMonth = eachDayOfInterval({ 
    start: startOfMonth(currentDate), 
    end: endOfMonth(currentDate) 
  });
  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="text-primary-600" size={32} />
            Crop Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Smart scheduling for your farm operations</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
          <Plus size={20} />
          New Event
        </button>
      </div>

      <div className="card !p-0 overflow-hidden border-none shadow-xl">
        <div className="bg-primary-600 dark:bg-primary-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
             <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} aria-label="Previous month" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} /></button>
             <h2 className="text-2xl font-black min-w-[200px] text-center">
               {format(currentDate, 'MMMM yyyy')}
             </h2>
             <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} aria-label="Next month" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={24} /></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">Today</button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-black text-gray-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => <div key={`empty-${i}`} className="h-32 bg-gray-100/50 dark:bg-gray-800/20 rounded-xl"></div>)}
            {daysInMonth.map(day => {
              const dayEvents = getEventsForDate(day);
              const cropActivities = getCropDatesForDate(day);
              const isTodayDate = isToday(day);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`h-32 p-2 rounded-xl border-2 transition-all group relative overflow-y-auto ${
                    isTodayDate 
                      ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-lg z-10' 
                      : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                >
                  <div className={`text-sm font-black mb-2 ${isTodayDate ? 'text-primary-600' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                        className={`w-full text-left p-1 rounded border text-[10px] font-bold truncate transition-transform hover:scale-105 ${getEventColor(event.event_type)} ${event.is_completed ? 'opacity-40 grayscale' : ''}`}
                      >
                        {event.title}
                      </button>
                    ))}
                    {cropActivities.sowing.map(crop => (
                      <div key={crop.id} className="w-full bg-green-500 text-white p-1 rounded text-[10px] font-black truncate">
                        SOW: {crop.name}
                      </div>
                    ))}
                    {cropActivities.harvest.map(crop => (
                      <div key={crop.id} className="w-full bg-amber-500 text-white p-1 rounded text-[10px] font-black truncate">
                        HARVEST: {crop.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 bg-primary-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-wider">New Activity</h2>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="label">Activity Type</label>
                <select className="input" value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value as any})}>
                  <option value="planting">Planting</option>
                  <option value="harvest">Harvest</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label">Task Title</label>
                <input className="input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Fertilize Field A" required />
              </div>
              <div className="space-y-1">
                <label className="label">Date</label>
                <input type="date" className="input" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} required />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-4 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in duration-200">
            <div className={`h-32 ${getEventColor(selectedEvent.event_type)} flex items-center justify-center border-none`}>
              {(() => {
                const Icon = getEventIcon(selectedEvent.event_type);
                return <Icon size={64} className="opacity-40" />;
              })()}
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{selectedEvent.title}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedEvent.event_type}</p>
                </div>
                <button onClick={() => setShowEventModal(false)}><X size={24} className="text-gray-300" /></button>
              </div>
              
              <div className="flex items-center gap-2 text-primary-600 font-bold mb-6">
                <CalendarIcon size={18} />
                {format(new Date(selectedEvent.event_date), 'MMMM d, yyyy')}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleToggleComplete(selectedEvent)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                    selectedEvent.is_completed 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                  }`}
                >
                  <Check size={18} />
                  {selectedEvent.is_completed ? 'Undo' : 'Done'}
                </button>
                <button onClick={() => handleDeleteEvent(selectedEvent.id)} className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all">
                  <Trash2 size={18} />
                  Delete
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
