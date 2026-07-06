import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Check, X, Sprout, Droplets, Bug, Droplet, Package, Loader, Save } from 'lucide-react';
import api from '../services/api';
import { format, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Crop } from '../types';
import { getCropIcon } from '../utils/cropIcons';
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  const selectedYear = currentDate.getFullYear();

  useEffect(() => {
    loadData();
  }, [selectedYear, user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const startOfYear = new Date(selectedYear, 0, 1);
      const endOfYear = new Date(selectedYear, 11, 31);
      
      const [eventsRes, cropsRes] = await Promise.all([
        api.getCalendarEvents(undefined, format(startOfYear, 'yyyy-MM-dd'), format(endOfYear, 'yyyy-MM-dd')),
        api.getCrops()
      ]);

      setEvents(eventsRes.data || []);
      setCrops(cropsRes.data || []);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toast.error('Failed to load calendar events');
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

  // Helper to convert date to percentage of year
  const getYearPercent = (dateStr: string) => {
    const d = new Date(dateStr);
    const startOfYear = new Date(selectedYear, 0, 1).getTime();
    const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59).getTime();
    const time = d.getTime();
    
    if (time < startOfYear) return 0;
    if (time > endOfYear) return 100;
    
    return ((time - startOfYear) / (endOfYear - startOfYear)) * 100;
  };

  // Build the months list for rendering
  const renderMonths = () => {
    return MONTH_NAMES.map((monthName, mIndex) => {
      const monthStart = new Date(selectedYear, mIndex, 1);
      const monthEnd = new Date(selectedYear, mIndex + 1, 0);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const firstDayOffset = monthStart.getDay();
      const emptySlots = Array(firstDayOffset).fill(null);

      return (
        <div key={monthName} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between">
          <div>
            <h3 className="text-center font-black text-sm text-gray-800 dark:text-white uppercase tracking-wider mb-3">
              {monthName}
            </h3>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day, idx) => (
                <div key={`${monthName}-header-${idx}`} className="text-center text-[10px] font-black text-gray-400 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptySlots.map((_, idx) => (
                <div key={`${monthName}-empty-${idx}`} className="aspect-square"></div>
              ))}
              {days.map((day) => {
                const dayEvents = getEventsForDate(day);
                const isTodayDate = isToday(day);
                const hasEvents = dayEvents.length > 0;

                // Event dot styling
                const hasPlanting = dayEvents.some(e => e.event_type === 'planting');
                const hasHarvest = dayEvents.some(e => e.event_type === 'harvest');
                const hasOther = dayEvents.some(e => e.event_type !== 'planting' && e.event_type !== 'harvest');

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      const dayEvents = getEventsForDate(day);
                      if (dayEvents.length > 0) {
                        setSelectedEvent(dayEvents[0]);
                        setShowEventModal(true);
                      } else {
                        setNewEvent({ ...newEvent, event_date: format(day, 'yyyy-MM-dd') });
                        setShowAddModal(true);
                      }
                    }}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative cursor-pointer group hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all ${
                      isTodayDate 
                        ? 'bg-primary-600 font-bold text-white shadow-md shadow-primary-500/20' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{format(day, 'd')}</span>
                    
                    {/* Compact event dots */}
                    {hasEvents && !isTodayDate && (
                      <div className="flex gap-0.5 mt-0.5 absolute bottom-1">
                        {hasPlanting && <span className="w-1 h-1 rounded-full bg-green-500"></span>}
                        {hasHarvest && <span className="w-1 h-1 rounded-full bg-amber-500"></span>}
                        {hasOther && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
                      </div>
                    )}

                    {/* Tooltip containing events */}
                    {hasEvents && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded-lg p-2 shadow-xl z-20 pointer-events-none space-y-1">
                        <p className="font-black border-b border-white/20 pb-0.5 uppercase tracking-wider">
                          {format(day, 'MMM d, yyyy')}
                        </p>
                        {dayEvents.map(e => (
                          <div key={e.id} className="flex items-center gap-1.5 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              e.event_type === 'planting' ? 'bg-green-400' :
                              e.event_type === 'harvest' ? 'bg-amber-400' : 'bg-blue-400'
                            }`} />
                            <span className="truncate">{e.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header section with Year Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="text-primary-600" size={32} />
            Annual Crop Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Smart scheduling & crop lifecycle timelines</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-1">
            <button 
              onClick={() => setCurrentDate(new Date(selectedYear - 1, 0, 1))} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 font-black text-gray-800 dark:text-white tracking-widest">{selectedYear}</span>
            <button 
              onClick={() => setCurrentDate(new Date(selectedYear + 1, 0, 1))} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            Today
          </button>

          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 py-2 text-sm">
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      {/* 12-Month Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {renderMonths()}
      </div>

      {/* Crop Timelines Section */}
      <div className="card p-6 shadow-xl space-y-6">
        <div className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
          <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
            <Sprout className="text-primary-600" size={24} />
            Crop Growth Timelines ({selectedYear})
          </h2>
          <p className="text-xs text-gray-500 mt-1">Horizontal streaks plotting sowing-to-harvest lifecycles</p>
        </div>

        {crops.length === 0 ? (
          <div className="text-center py-12">
            <Sprout size={48} className="mx-auto text-gray-300 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-gray-400">No crops active or planned for this season</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Timeline Month Header */}
            <div className="flex items-center">
              <div className="w-48 shrink-0 text-xs font-black uppercase tracking-widest text-gray-400">Crop Details</div>
              <div className="flex-1 grid grid-cols-12 gap-0 text-center text-[10px] font-black text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                {MONTH_NAMES.map(m => (
                  <div key={`timeline-h-${m}`} className="truncate border-l border-gray-100 dark:border-gray-800 first:border-l-0">
                    {m.substring(0, 3)}
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Tracks */}
            <div className="space-y-3">
              {crops.map((crop) => {
                const icon = getCropIcon(crop.name);
                
                // Determine streak limits
                const startPercent = getYearPercent(crop.sowingDate);
                
                // End date logic: if harvested, use harvestDate. If active, track it to today/now.
                const endPercent = getYearPercent(
                  crop.harvestDate || 
                  (crop.status === 'active' ? format(new Date(), 'yyyy-MM-dd') : format(new Date(crop.sowingDate).getTime() + (crop.growthPeriod || 120) * 86400000, 'yyyy-MM-dd'))
                );

                const left = Math.min(startPercent, endPercent);
                const width = Math.max(Math.abs(endPercent - startPercent), 3); // minimum 3% width for visibility
                const isActive = crop.status === 'active';

                return (
                  <div key={crop.id} className="flex items-center group">
                    {/* Left Column: Crop Info */}
                    <div className="w-48 shrink-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">{icon}</span>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate">{crop.name}</h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {format(new Date(crop.sowingDate), 'MMM d')} - {crop.harvestDate ? format(new Date(crop.harvestDate), 'MMM d') : 'Active'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Track */}
                    <div className="flex-1 h-12 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl relative overflow-hidden border border-gray-100 dark:border-gray-800/80 flex items-center">
                      
                      {/* Month boundaries background */}
                      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                        {Array(12).fill(0).map((_, i) => (
                          <div key={`grid-line-${i}`} className="border-l border-gray-100 dark:border-gray-800/50 first:border-l-0 h-full"></div>
                        ))}
                      </div>

                      {/* Continuous Date Streak */}
                      <div 
                        style={{ left: `${left}%`, width: `${width}%` }}
                        className={`absolute h-8 rounded-full shadow-sm flex items-center justify-between px-3 cursor-pointer group/streak transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-emerald-500/90 to-green-400/90 text-white shadow-emerald-500/10 hover:shadow-lg' 
                            : 'bg-gradient-to-r from-amber-500/90 to-orange-400/90 text-white shadow-amber-500/10 hover:shadow-lg'
                        }`}
                      >
                        <span className="text-xs font-black truncate drop-shadow-sm flex items-center gap-1">
                          <span>{icon}</span>
                          <span className="hidden sm:inline">{crop.name}</span>
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider drop-shadow-sm shrink-0">
                          {isActive ? 'Growing' : 'Harvested'}
                        </span>

                        {/* Timeline Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover/streak:block bg-gray-900 text-white text-[10px] rounded-lg p-2.5 shadow-xl z-20 pointer-events-none space-y-1">
                          <p className="font-black border-b border-white/20 pb-0.5 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{icon}</span> {crop.name}
                          </p>
                          <p><span className="font-bold text-gray-400">Sown Date:</span> {format(new Date(crop.sowingDate), 'MMMM d, yyyy')}</p>
                          <p>
                            <span className="font-bold text-gray-400">Harvest Date:</span> {
                              crop.harvestDate ? format(new Date(crop.harvestDate), 'MMMM d, yyyy') : 'Still Growing (Active)'
                            }
                          </p>
                          <p><span className="font-bold text-gray-400">Status:</span> {isActive ? '🟢 Active' : '🟡 Harvested'}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
            <div className="px-8 py-6 bg-primary-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-wider">New Activity</h2>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEvent} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-1">Activity Type</label>
                <select className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none" value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value as any})}>
                  <option value="planting">Planting</option>
                  <option value="harvest">Harvest</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="irrigation">Irrigation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-1">Task Title</label>
                <input className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Fertilize Field A" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-1">Date</label>
                <input type="date" className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} required />
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

      {/* Selected Event Modal */}
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
