import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../hooks/useLocation';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Navigation, Trash2, RotateCcw, Save, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix Leaflet's default marker icon paths in React
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
  boundaryCoordinates?: string | null; // Expects JSON array string e.g. "[[lat1,lng1],[lat2,lng2],...]"
  isEditable?: boolean;
  onChangeLocation?: (
    lat: number,
    lon: number,
    address: string,
    boundaryCoords: string | null,
    stateVal: string,
    districtVal: string,
    villageVal: string
  ) => void;
}

// Component to programmatically center map
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Click event handler for drawing boundary/placing pin
function MapClickHandler({
  onMapClick,
  enabled
}: {
  onMapClick: (latlng: L.LatLng) => void;
  enabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

const LocationMap = ({
  latitude,
  longitude,
  locationName,
  height = '400px',
  boundaryCoordinates,
  isEditable = false,
  onChangeLocation,
}: LocationMapProps) => {
  const { location: gpsLocation } = useLocation();
  const { theme } = useTheme();

  // Internal states
  const [lat, setLat] = useState<number>(latitude || 20.5937); // Defaults to center of India
  const [lng, setLng] = useState<number>(longitude || 78.9629);
  const center: [number, number] = [lat, lng];
  const [stateVal, setStateVal] = useState<string>('');
  const [districtVal, setDistrictVal] = useState<string>('');
  const [villageVal, setVillageVal] = useState<string>('');
  const [drawMode, setDrawMode] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    if (latitude && longitude) {
      setLat(latitude);
      setLng(longitude);
    } else if (gpsLocation.latitude && gpsLocation.longitude) {
      setLat(gpsLocation.latitude);
      setLng(gpsLocation.longitude);
    }
  }, [latitude, longitude, gpsLocation]);

  useEffect(() => {
    if (boundaryCoordinates) {
      try {
        const parsed = JSON.parse(boundaryCoordinates);
        if (Array.isArray(parsed)) {
          setDrawnPoints(parsed);
        }
      } catch (e) {
        console.error('Failed to parse boundaryCoordinates JSON', e);
      }
    }
  }, [boundaryCoordinates]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--map-height', height);
    }
  }, [height]);

  // Click on map callback
  const handleMapClick = (latlng: L.LatLng) => {
    if (drawMode) {
      // Append vertex to boundary polygon
      setDrawnPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
      toast.success(`Vertex added: [${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}]`);
    } else {
      // Reposition main farm pin marker
      setLat(latlng.lat);
      setLng(latlng.lng);
      toast.success(`Pin moved to: [${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}]`);
    }
  };

  // Get current GPS coords
  const triggerGPS = () => {
    if (gpsLocation.latitude && gpsLocation.longitude) {
      setLat(gpsLocation.latitude);
      setLng(gpsLocation.longitude);
      if (gpsLocation.address) {
        // Mock parse district/state
        const parts = gpsLocation.address.split(',').map(s => s.trim());
        if (parts.length >= 3) {
          setVillageVal(parts[0]);
          setDistrictVal(parts[1]);
          setStateVal(parts[parts.length - 2]);
        }
      }
      toast.success('Centered on GPS coordinates');
    } else {
      // Browser navigator geolocation fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLat(pos.coords.latitude);
            setLng(pos.coords.longitude);
            toast.success('Acquired high-accuracy GPS coordinates');
          },
          () => {
            toast.error('Unable to acquire GPS lock. Please check browser permissions.');
          }
        );
      }
    }
  };

  // Clear drawn points
  const clearBoundary = () => {
    setDrawnPoints([]);
    toast.success('Boundary boundary cleared');
  };

  // Undo last drawn vertex point
  const undoLastVertex = () => {
    setDrawnPoints((prev) => prev.slice(0, -1));
    toast.success('Removed last boundary vertex');
  };

  // Save changes
  const saveMapData = () => {
    if (onChangeLocation) {
      const address = [villageVal, districtVal, stateVal].filter(Boolean).join(', ') || locationName || 'Manual Plot';
      const boundaryJson = drawnPoints.length > 2 ? JSON.stringify(drawnPoints) : null;
      onChangeLocation(lat, lng, address, boundaryJson, stateVal, districtVal, villageVal);
      toast.success('Map location and boundaries saved!');
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-4 w-full h-full min-h-0 bg-transparent">
      {/* Map Side */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative h-full min-h-0" style={{ height }}>
        <MapContainer
          key={theme} // Force redraw on theme swap
          center={center}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          className="dark:brightness-95"
        >
          <MapUpdater center={center} />
          <MapClickHandler onMapClick={handleMapClick} enabled={isEditable} />

          {theme === 'dark' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Main Pin Marker */}
          <Marker position={center}>
            <Popup>
              <div className="text-center font-sans p-1">
                <MapPin size={16} className="mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                <strong className="text-sm block">{locationName || 'Farm Center'}</strong>
                <span className="text-[10px] text-gray-500 block mt-1">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Draw Polygon vertices markers */}
          {isEditable && drawnPoints.map((point, idx) => (
            <Marker
              key={`vertex-${idx}`}
              position={point}
              icon={L.divIcon({
                className: 'bg-accent w-3 h-3 rounded-full border-2 border-white shadow-md',
                iconSize: [12, 12]
              })}
            />
          ))}

          {/* Boundary Polygon rendering */}
          {drawnPoints.length > 1 && (
            <Polygon
              positions={drawnPoints}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.25,
                weight: 3,
                dashArray: drawMode ? '5, 5' : undefined
              }}
            />
          )}
        </MapContainer>

        {/* Float drawing indicators */}
        {isEditable && drawMode && (
          <div className="absolute top-4 left-14 z-[400] bg-white/90 dark:bg-[#0b130e]/95 backdrop-blur border border-accent/30 px-4 py-2 rounded-xl text-xs font-black text-emerald-600 uppercase tracking-widest animate-pulse shadow-md">
            📍 Boundary Mode: Click Map to Place Vertices
          </div>
        )}
      </div>

      {/* Control side panel when editable */}
      {isEditable && (
        <div className="w-full lg:w-80 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] shadow-xl flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
              <Compass className="text-accent" size={20} />
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Mapping Controls</h3>
            </div>

            {/* GPS Trigger */}
            <button
              onClick={triggerGPS}
              className="w-full py-3 bg-accent hover:bg-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Navigation size={14} className="animate-pulse" />
              Use My GPS Coordinates
            </button>

            {/* Map Mode selectors */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/50 dark:border-white/5">
              <button
                onClick={() => setDrawMode(false)}
                className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!drawMode ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-400'}`}
              >
                Pin Mode
              </button>
              <button
                onClick={() => setDrawMode(true)}
                className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${drawMode ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-400'}`}
              >
                Boundary Mode
              </button>
            </div>

            {/* Manual Lat Long inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Village</label>
                <input
                  type="text"
                  value={villageVal}
                  onChange={(e) => setVillageVal(e.target.value)}
                  placeholder="e.g. Igatpuri"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">District</label>
                <input
                  type="text"
                  value={districtVal}
                  onChange={(e) => setDistrictVal(e.target.value)}
                  placeholder="e.g. Nashik"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">State</label>
                <input
                  type="text"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Polygon draw options */}
            {drawnPoints.length > 0 && (
              <div className="flex gap-2 border-t border-gray-100 dark:border-white/5 pt-4">
                <button
                  onClick={undoLastVertex}
                  className="flex-1 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw size={12} />
                  Undo point
                </button>
                <button
                  onClick={clearBoundary}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 size={12} />
                  Clear Poly
                </button>
              </div>
            )}
          </div>

          {/* Action triggers */}
          <button
            onClick={saveMapData}
            className="w-full py-4 bg-accent hover:bg-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save size={14} />
            Apply Coordinates
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
