import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { getToken } from '../utils/storage';

export default function MediaPanel({ media, socket, roomId, room }) {
  const [uploading, setUploading] = useState(false);
  const [addLocation, setAddLocation] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { user } = useAuth();

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!roomId) {
      alert('Room ID is missing. Please refresh the page.');
      return;
    }

    setUploading(true);
    
    let location = null;
    
    // Get location if checkbox is checked
    if (addLocation) {
      setGettingLocation(true);
      try {
        location = await getCurrentLocation();
        console.log('[Media] Got location:', location);
      } catch (error) {
        console.error('[Media] Location error:', error);
        if (!confirm('Could not get location. Upload without location?')) {
          setUploading(false);
          setGettingLocation(false);
          return;
        }
      }
      setGettingLocation(false);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);
      
      const token = getToken();
      const { data } = await apiClient.post('/media/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[Media] Upload successful:', data);
      socket?.emit('send-media', { 
        roomId, 
        url: data.url, 
        type: data.type,
        location: location // Include location if available
      });
      e.target.value = ''; // Reset file input
    } catch (error) {
      console.error('[Media] Upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
      e.target.value = ''; // Reset file input
    } finally {
      setUploading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleDelete = (mediaId, mediaUserId) => {
    // Check if user can delete (own media or admin)
    const canDelete = user.id === mediaUserId || room?.admin === user.id;
    
    if (!canDelete) {
      alert('You can only delete your own images');
      return;
    }

    if (confirm('Delete this image?')) {
      console.log('[Media] Deleting media:', mediaId);
      socket?.emit('delete-media', { roomId, mediaId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-bold mb-3">Media</h2>
        
        {/* Add Location Checkbox */}
        <div className="mb-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={addLocation}
              onChange={(e) => setAddLocation(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
              disabled={uploading}
            />
            <span>Add current location to image</span>
          </label>
        </div>

        {/* Upload Button */}
        <label className="bg-blue-500 text-white px-3 py-2 rounded cursor-pointer text-sm inline-block hover:bg-blue-600 transition-colors">
          {gettingLocation ? 'Getting location...' : uploading ? 'Uploading...' : 'Upload Image'}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            className="hidden" 
            disabled={uploading || gettingLocation} 
          />
        </label>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {media.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            No images yet. Upload one to get started!
          </div>
        ) : (
          media.map((item) => {
            const isOwner = user.id === item.userId;
            const isAdmin = room?.admin === user.id;
            const canDelete = isOwner || isAdmin;

            return (
              <div key={item.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {/* Header with user info and delete button */}
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {item.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {item.userName}
                        {isOwner && <span className="text-xs text-blue-600 ml-1">(You)</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item.id, item.userId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      title={isAdmin && !isOwner ? 'Delete (Admin)' : 'Delete'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Image */}
                <div className="p-2">
                  <img 
                    src={item.url} 
                    alt={`Shared by ${item.userName}`}
                    className="w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(item.url, '_blank')}
                  />
                </div>

                {/* Location Info */}
                {item.location && (
                  <div className="px-2 pb-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Location:</span>
                      <span>{item.location.lat.toFixed(6)}, {item.location.lng.toFixed(6)}</span>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`, '_blank')}
                        className="ml-auto text-blue-600 hover:text-blue-800 underline"
                      >
                        View on Map
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
