import apiClient from './apiClient';

/**
 * Create new room
 * @returns {Promise<object>} { roomId, joinLink }
 */
export const createRoom = async () => {
  const response = await apiClient.post('/rooms/create');
  return response.data;
};

/**
 * Check if room exists
 * @param {string} roomId
 * @returns {Promise<object>} { exists, room }
 */
export const checkRoom = async (roomId) => {
  const response = await apiClient.get(`/rooms/${roomId}/check`);
  return response.data;
};

/**
 * Get room details
 * @param {string} roomId
 * @returns {Promise<object>} { room }
 */
export const getRoomDetails = async (roomId) => {
  const response = await apiClient.get(`/rooms/${roomId}`);
  return response.data;
};

/**
 * End room (admin only)
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export const endRoom = async (roomId) => {
  const response = await apiClient.post(`/rooms/${roomId}/end`);
  return response.data;
};
