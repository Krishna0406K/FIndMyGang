import apiClient from './apiClient';

export const createRoom = async () => {
  const response = await apiClient.post('/rooms/create');
  return response.data;
};

export const checkRoom = async (roomId) => {
  const response = await apiClient.get(`/rooms/${roomId}/check`);
  return response.data;
};

export const getRoomDetails = async (roomId) => {
  const response = await apiClient.get(`/rooms/${roomId}`);
  return response.data;
};

export const endRoom = async (roomId) => {
  const response = await apiClient.post(`/rooms/${roomId}/end`);
  return response.data;
};
