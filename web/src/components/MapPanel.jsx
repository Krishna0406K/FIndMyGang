import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for media locations
const mediaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapPanel({ locations, media, socket, roomId }) {
  const [sharing, setSharing] = useState(false);
  const [showMediaLocations, setShowMediaLocations] = useState(true);

  useEffect(() => {
    if (!sharing) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket?.emit('update-location', { roomId, lat: latitude, lng: longitude });
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [sharing, socket, roomId]);

  // Live user locations
  const locationArray = Object.entries(locations).map(([userId, loc]) => ({
    userId,
    type: 'user',
    ...loc
  }));

  // Media locations (images with location)
  const mediaLocations = media
    .filter(item => item.location)
    .map(item => ({
      id: item.id,
      type: 'media',
      lat: item.location.lat,
      lng: item.location.lng,
      userName: item.userName,
      url: item.url,
      timestamp: item.timestamp
    }));

  // Combine all locations for center calculation
  const allLocations = [...locationArray, ...(showMediaLocations ? mediaLocations : [])];
  const center = allLocations[0] ? [allLocations[0].lat, allLocations[0].lng] : [20, 0];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-white">
        <h2 className="font-bold mb-3">Map</h2>
        
        <div className="space-y-2">
          {/* Live Location Sharing */}
          <button
            onClick={() => setSharing(!sharing)}
            className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
              sharing 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {sharing ? '🔴 Stop Sharing Live Location' : '📍 Share Live Location'}
          </button>

          {/* Toggle Media Locations */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showMediaLocations}
              onChange={(e) => setShowMediaLocations(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Show image locations ({mediaLocations.length})</span>
          </label>
        </div>
      </div>
      
      <div className="flex-1">
        <MapContainer center={center} zoom={2} style={{ height: '100%', width: '100%' }}>
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Live User Locations (Blue markers) */}
          {locationArray.map((loc) => (
            <Marker key={loc.userId} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="text-center">
                  <strong>📍 {loc.userName}</strong>
                  <div className="text-xs text-gray-600">Live Location</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Media Locations (Red markers) */}
          {showMediaLocations && mediaLocations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={mediaIcon}>
              <Popup>
                <div className="text-center">
                  <strong>📷 {loc.userName}</strong>
                  <div className="text-xs text-gray-600 mb-2">
                    {new Date(loc.timestamp).toLocaleString()}
                  </div>
                  <img 
                    src={loc.url} 
                    alt="Location" 
                    className="w-32 h-32 object-cover rounded cursor-pointer"
                    onClick={() => window.open(loc.url, '_blank')}
                  />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
