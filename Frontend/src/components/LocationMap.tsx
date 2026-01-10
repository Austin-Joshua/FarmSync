import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../hooks/useLocation';
import { useTheme } from '../context/ThemeContext';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  height?: string;
}

// Component to update map center when location changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const LocationMap = ({ latitude, longitude, locationName, height = '400px' }: LocationMapProps) => {
  const { location: gpsLocation } = useLocation();
  const { theme } = useTheme();
  const [mapLocation, setMapLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null);

  useEffect(() => {
    // Use provided coordinates or GPS coordinates
    if (latitude && longitude) {
      setMapLocation({ lat: latitude, lon: longitude, name: locationName });
    } else if (gpsLocation.latitude && gpsLocation.longitude) {
      setMapLocation({
        lat: gpsLocation.latitude,
        lon: gpsLocation.longitude,
        name: gpsLocation.address || locationName,
      });
    }
  }, [latitude, longitude, locationName, gpsLocation]);

  if (!mapLocation) {
    return (
      <div className="card bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No location available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Enable location to view map</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [mapLocation.lat, mapLocation.lon];

  return (
    <div className="card p-0 overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height }}>
      <MapContainer
        key={theme} // Force re-render when theme changes
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="dark:brightness-90"
      >
        <MapUpdater center={center} />
        {theme === 'dark' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <Marker position={center}>
          <Popup>
            <div className="text-center">
              <MapPin size={20} className="mx-auto mb-2 text-primary-600 dark:text-primary-400" />
              <strong className="text-gray-900 dark:text-gray-100">{mapLocation.name || 'Your Location'}</strong>
              <br />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {mapLocation.lat.toFixed(6)}, {mapLocation.lon.toFixed(6)}
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
