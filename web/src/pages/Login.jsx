import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginService({ email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border-t-4 border-emerald-500">
        <div className="flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">FindMyGang</h1>
        <p className="text-center text-gray-600 mb-6">Login to find your gang</p>
        {loading && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-4 text-sm">
            Connecting to server... This may take up to 30 seconds on first load.
          </div>
        )}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-emerald-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-emerald-500 focus:outline-none"
            required
          />
          <button 
            type="submit" 
            className="w-full bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-semibold transition-colors"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-emerald-500 hover:text-emerald-600 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
