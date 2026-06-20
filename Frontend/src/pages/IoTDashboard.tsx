import React, { useState, useEffect } from 'react';
import { ThermometerSun, Droplets, Activity, Wifi, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface SensorData {
  id: string;
  type: string;
  value: number;
  unit: string;
  status: string;
}

interface IoTMessage {
  timestamp: string;
  sensors: SensorData[];
}

const IoTDashboard: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [dataHistory, setDataHistory] = useState<any[]>([]);
  const [latestData, setLatestData] = useState<IoTMessage | null>(null);

  useEffect(() => {
    // Connect to WebSocket using SockJS
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    
    // Disable debug logging to avoid console spam
    stompClient.debug = () => {};

    stompClient.connect({}, () => {
      setConnected(true);
      
      stompClient.subscribe('/topic/sensors', (message) => {
        if (message.body) {
          const payload: IoTMessage = JSON.parse(message.body);
          setLatestData(payload);
          
          setDataHistory(prev => {
            const time = new Date(payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            // Extract values
            let temp = 0;
            let moist = 0;
            payload.sensors.forEach(s => {
              if (s.type === 'temperature') temp = s.value;
              if (s.type === 'soil_moisture') moist = s.value;
            });
            
            const newPoint = { time, temp, moist };
            const newHistory = [...prev, newPoint];
            // Keep last 15 points
            if (newHistory.length > 15) return newHistory.slice(newHistory.length - 15);
            return newHistory;
          });
        }
      });
    }, (error) => {
      console.error('STOMP error:', error);
      setConnected(false);
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => {});
      }
    };
  }, []);

  const getSensor = (type: string) => {
    return latestData?.sensors.find(s => s.type === type);
  };

  const tempSensor = getSensor('temperature');
  const moistSensor = getSensor('soil_moisture');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Real-Time IoT Sensors</h1>
          <p className="text-gray-500 dark:text-gray-400">Live environmental monitoring from field devices</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${connected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Gauges/Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl">
              <ThermometerSun className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Air Temperature</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {tempSensor ? tempSensor.value : '--'}
                </h3>
                <span className="text-lg font-medium text-gray-500">°C</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Droplets className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Soil Moisture</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {moistSensor ? moistSensor.value : '--'}
                </h3>
                <span className="text-lg font-medium text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {connected ? 'Active' : 'Offline'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Live Sensor Feed</h2>
        <div className="h-[400px]">
          {dataHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#f97316" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#f97316' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: 'Moisture (%)', angle: 90, position: 'insideRight', fill: '#3b82f6' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="moist" name="Soil Moisture" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {connected ? 'Waiting for sensor data...' : 'Connect to view live data stream.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;
