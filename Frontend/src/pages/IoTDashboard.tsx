// IoT Dashboard — Live Sensor Readings with animated charts
import { useState, useEffect, useRef } from 'react';
import {
  Wifi, Thermometer, Droplets, Wind, Sun, AlertTriangle,
  Battery, Signal, RefreshCw, Activity, Leaf, Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const SENSORS = [
  { id: 'temp', label: 'Soil Temp', unit: '°C', baseValue: 28, min: 15, max: 45, icon: Thermometer, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400', optimal: [20, 35] },
  { id: 'humidity', label: 'Air Humidity', unit: '%', baseValue: 72, min: 20, max: 100, icon: Droplets, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', optimal: [50, 85] },
  { id: 'soil_moisture', label: 'Soil Moisture', unit: '%', baseValue: 65, min: 0, max: 100, icon: Droplets, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400', optimal: [40, 80] },
  { id: 'ph', label: 'Soil pH', unit: 'pH', baseValue: 6.8, min: 4, max: 9, icon: Leaf, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', optimal: [6, 7.5] },
  { id: 'light', label: 'Light (PAR)', unit: 'μmol', baseValue: 820, min: 0, max: 2000, icon: Sun, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400', optimal: [400, 1600] },
  { id: 'wind', label: 'Wind Speed', unit: 'km/h', baseValue: 12, min: 0, max: 80, icon: Wind, color: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-600 dark:text-cyan-400', optimal: [0, 30] },
];

const DEVICES = [
  { id: 'device-1', name: 'Field Sensor A', location: 'North Block', battery: 87, signal: 4, online: true },
  { id: 'device-2', name: 'Field Sensor B', location: 'South Block', battery: 42, signal: 3, online: true },
  { id: 'device-3', name: 'Weather Station', location: 'Farm Center', battery: 95, signal: 5, online: true },
  { id: 'device-4', name: 'Irrigation Controller', location: 'Pump House', battery: 12, signal: 2, online: false },
];

const generatePoint = (base: number, variance: number) =>
  Math.max(0, parseFloat((base + (Math.random() - 0.5) * variance).toFixed(2)));

const IoTDashboard = () => {
  const maxHistory = 20;
  const [readings, setReadings] = useState<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    SENSORS.forEach(s => { r[s.id] = s.baseValue; });
    return r;
  });
  const [history, setHistory] = useState<Record<string, { time: string; value: number }[]>>(() => {
    const h: Record<string, { time: string; value: number }[]> = {};
    SENSORS.forEach(s => { h[s.id] = []; });
    return h;
  });
  const [selectedSensor, setSelectedSensor] = useState('temp');
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setReadings(prev => {
        const next: Record<string, number> = {};
        SENSORS.forEach(s => {
          const variance = (s.max - s.min) * 0.04;
          next[s.id] = Math.min(s.max, Math.max(s.min, generatePoint(prev[s.id], variance)));
        });
        setHistory(h => {
          const nh: typeof h = {};
          SENSORS.forEach(s => {
            const prev2 = h[s.id] || [];
            nh[s.id] = [...prev2.slice(-maxHistory + 1), { time: now, value: next[s.id] }];
          });
          return nh;
        });
        return next;
      });
    }, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  const isOptimal = (sensor: typeof SENSORS[0]) =>
    readings[sensor.id] >= sensor.optimal[0] && readings[sensor.id] <= sensor.optimal[1];

  const selectedSensorObj = SENSORS.find(s => s.id === selectedSensor)!;
  const chartData = history[selectedSensor] || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wifi size={26} className="text-primary-600" /> IoT Sensor Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              LIVE
            </span>
            <span className="text-xs text-gray-400">— Updates every 2 seconds</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              paused ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {paused ? <><RefreshCw size={16} /> Resume</> : <><Activity size={16} /> Pause</>}
          </button>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {SENSORS.map(sensor => {
          const val = readings[sensor.id];
          const optimal = isOptimal(sensor);
          const pct = ((val - sensor.min) / (sensor.max - sensor.min)) * 100;
          const isSelected = selectedSensor === sensor.id;
          return (
            <button
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all text-left hover:scale-100 active:scale-100 ${sensor.bg} ${
                isSelected ? sensor.border + ' shadow-lg' : 'border-transparent'
              }`}
            >
              {/* Status dot */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${optimal ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
              <div className={`${sensor.text} mb-1.5`}><sensor.icon size={18} /></div>
              <p className={`text-xl sm:text-2xl font-black ${sensor.text}`}>
                {typeof val === 'number' ? (Number.isInteger(sensor.baseValue) ? Math.round(val) : val.toFixed(1)) : '--'}
                <span className="text-xs font-bold ml-0.5">{sensor.unit}</span>
              </p>
              <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-0.5">{sensor.label}</p>
              <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000`} style={{ width: `${pct}%`, backgroundColor: sensor.color }} />
              </div>
              <p className={`text-[9px] font-bold mt-1 ${optimal ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {optimal ? '✓ Optimal' : '⚠ Out of Range'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Live Chart */}
      <div className="card border-none shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <selectedSensorObj.icon size={20} style={{ color: selectedSensorObj.color }} />
            {selectedSensorObj.label} — Live History
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Eye size={13} />
            {chartData.length} data points
          </div>
        </div>
        <div className="h-40 sm:h-56 w-full">
          {chartData.length < 2 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              <Activity size={20} className="mr-2 animate-pulse" /> Collecting data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="sensorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedSensorObj.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={selectedSensorObj.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[selectedSensorObj.min, selectedSensorObj.max]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} ${selectedSensorObj.unit}`, selectedSensorObj.label]} />
                <Area
                  type="monotone" dataKey="value" stroke={selectedSensorObj.color}
                  strokeWidth={2.5} fill="url(#sensorGrad)" dot={false} isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Device List */}
      <div className="card border-none shadow-xl">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Signal size={20} className="text-primary-600" /> Connected Devices
        </h2>
        <div className="space-y-2.5">
          {DEVICES.map(device => (
            <div key={device.id} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${
              device.online
                ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 opacity-60'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${device.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{device.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{device.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 text-xs">
                  <Battery size={14} className={device.battery < 20 ? 'text-red-500' : 'text-gray-400'} />
                  <span className={device.battery < 20 ? 'text-red-500 font-bold' : 'text-gray-500'}>{device.battery}%</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Signal size={14} className="text-gray-400" />
                  <span className="text-gray-500">{device.signal}/5</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  device.online ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>
                  {device.online ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {SENSORS.some(s => !isOptimal(s)) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2 text-sm">
            <AlertTriangle size={16} /> Sensor Alerts
          </h3>
          <div className="space-y-1.5">
            {SENSORS.filter(s => !isOptimal(s)).map(s => (
              <div key={s.id} className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <s.icon size={14} />
                <span>{s.label}: <strong>{readings[s.id]?.toFixed(1)}{s.unit}</strong> — outside optimal range ({s.optimal[0]}–{s.optimal[1]}{s.unit})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTDashboard;
