import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRoom } from '../services/roomService';

export default function Dashboard() {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createRoom();
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    navigate(`/room/${joinCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center border-b-4 border-emerald-500">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <h1 className="text-2xl font-bold text-emerald-600">FindMyGang</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Welcome, <span className="font-semibold text-emerald-600">{user?.name}</span></span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </nav>
      
      <div className="container mx-auto p-8 max-w-2xl">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <div className="bg-white p-8 rounded-lg shadow-lg mb-6 border-t-4 border-emerald-500">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Create New Room</h2>
          <p className="text-gray-600 mb-4">Start a new location sharing session</p>
          <button 
            onClick={handleCreateRoom}
            className="w-full bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-teal-500">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Join Existing Room</h2>
          <p className="text-gray-600 mb-4">Enter a room code to join your gang</p>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-teal-500 focus:outline-none"
          />
          <button 
            onClick={handleJoinRoom}
            className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
