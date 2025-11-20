import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { checkRoom } from '../services/roomService';
import ChatPanel from '../components/ChatPanel';
import MediaPanel from '../components/MediaPanel';
import MapPanel from '../components/MapPanel';
import MembersList from '../components/MembersList';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [media, setMedia] = useState([]);
  const [locations, setLocations] = useState({});
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // First, check if room exists
  useEffect(() => {
    const verifyRoom = async () => {
      try {
        setChecking(true);
        await checkRoom(roomId);
        setChecking(false);
      } catch (err) {
        console.error('[Room] Room check failed:', err);
        setError(`Room "${roomId}" not found. It may have been deleted or never existed.`);
        setChecking(false);
      }
    };

    verifyRoom();
  }, [roomId]);

  // Then, join via socket
  useEffect(() => {
    if (!socket || !connected || checking || error) return;

    console.log('[Room] Attempting to join room:', roomId);
    
    // Join the room
    socket.emit('join-room', { roomId });

    // Handle reconnection - rejoin the room
    const handleReconnect = () => {
      console.log('[Room] Reconnected, rejoining room:', roomId);
      socket.emit('join-room', { roomId });
    };

    socket.on('reconnect', handleReconnect);

    socket.on('room-data', ({ room }) => {
      console.log('[Room] Received room data:', room);
      setRoom(room);
      setMessages(room.messages || []);
      setMedia(room.media || []);
      setLocations(room.locations || {});
      setUsers(room.users || []);
      setError(''); // Clear any previous errors
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('new-media', (mediaItem) => {
      setMedia(prev => [...prev, mediaItem]);
    });

    socket.on('media-deleted', ({ mediaId }) => {
      console.log('[Room] Media deleted:', mediaId);
      setMedia(prev => prev.filter(item => item.id !== mediaId));
    });

    socket.on('location-updated', ({ userId, userName, lat, lng }) => {
      setLocations(prev => ({ ...prev, [userId]: { lat, lng, userName } }));
    });

    socket.on('user-joined', ({ users }) => {
      setUsers(users);
    });

    socket.on('user-left', ({ users }) => {
      setUsers(users);
    });

    socket.on('room-ended', ({ message, adminName }) => {
      alert(message || 'Room has been ended by the admin');
      console.log(`[Room] Room ended by ${adminName}`);
      navigate('/dashboard');
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('reconnect');
      socket.off('room-data');
      socket.off('new-message');
      socket.off('new-media');
      socket.off('media-deleted');
      socket.off('location-updated');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-ended');
      socket.off('error');
    };
  }, [socket, connected, roomId, navigate, checking, error]);

  const handleLeave = () => {
    socket?.emit('leave-room', { roomId });
    navigate('/dashboard');
  };

  const handleEnd = () => {
    if (confirm('End this room for everyone? This action cannot be undone.')) {
      console.log('[Room] Admin ending room:', roomId);
      socket?.emit('end-room', { roomId });
      // Navigate immediately for admin (they'll get the room-ended event too)
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  };

  if (checking) return <div className="p-8">Verifying room...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Room Not Found</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
  if (!connected) return <div className="p-8">Connecting to room...</div>;
  if (!room) return <div className="p-8">Loading room data...</div>;

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Room: {roomId}</h1>
          <p className="text-sm text-gray-600">{users.length} members</p>
        </div>
        <div className="flex gap-2">
          {room.admin === user.id && (
            <button onClick={handleEnd} className="bg-red-500 text-white px-4 py-2 rounded">
              End Room
            </button>
          )}
          <button onClick={handleLeave} className="bg-gray-500 text-white px-4 py-2 rounded">
            Leave
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Members */}
        <div className="w-64 bg-gray-50 border-r overflow-y-auto">
          <MembersList users={users} />
        </div>
        
        {/* Main Content Area - Map (larger) and Chat (smaller) */}
        <div className="flex-1 flex flex-col">
          {/* Map Section - Takes 60% of height */}
          <div className="h-[60%] border-b">
            <MapPanel locations={locations} media={media} socket={socket} roomId={roomId} />
          </div>
          
          {/* Chat Section - Takes 40% of height */}
          <div className="h-[40%] overflow-y-auto">
            <ChatPanel messages={messages} socket={socket} roomId={roomId} />
          </div>
        </div>

        {/* Right Sidebar - Media */}
        <div className="w-80 bg-gray-50 border-l overflow-y-auto">
          <MediaPanel media={media} socket={socket} roomId={roomId} room={room} />
        </div>
      </div>
    </div>
  );
}
